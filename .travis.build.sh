#!/usr/bin/env bash

export PATH
PATH="$(pwd)/vendor/bin:$(pwd)/node_modules/.bin:$PATH"

source ~/.nvm/nvm.sh
nvm use "$NODE_VERSION"

module_dir="supremm"
module_name="SUPReMM"

# Fix for Travis not specifying a range if testing the first commit of
# a new branch on push
if [ -z "$TRAVIS_COMMIT_RANGE" ]; then
    TRAVIS_COMMIT_RANGE="$(git rev-parse --verify --quiet "${TRAVIS_COMMIT}^1")...${TRAVIS_COMMIT}"
fi

if [ "$TEST_SUITE" = "syntax" ] || [ "$TEST_SUITE" = "style" ]; then
    # Check whether the start of the commit range is available.
    # If it is not available, try fetching the complete history.
    commit_range_start="$(echo "$TRAVIS_COMMIT_RANGE" | sed -E 's/^([a-fA-F0-9]+).*/\1/')"
    if ! git show --format='' --no-patch "$commit_range_start" &>/dev/null; then
        git fetch --unshallow

        # If it's still unavailable (likely due a push build caused by a force push),
        # tests based on what has changed cannot be run.
        if ! git show --format='' --no-patch "$commit_range_start" &>/dev/null; then
            echo "Could not find commit range start ($commit_range_start)." >&2
            echo "Tests based on changed files cannot run." >&2
            exit 1
        fi
    fi

    # Get the files changed by this commit (excluding deleted files).
    files_changed=()
    while IFS= read -r -d $'\0' file; do
        files_changed+=("$file")
    done < <(git diff --name-only --diff-filter=da -z "$TRAVIS_COMMIT_RANGE")

    # Separate the changed files by language.
    php_files_changed=()
    js_files_changed=()
    json_files_changed=()
    for file in "${files_changed[@]}"; do
        if [[ "$file" == *.php ]]; then
            php_files_changed+=("$file")
        elif [[ "$file" == *.js ]]; then
            js_files_changed+=("$file")
        elif [[ "$file" == *.json ]]; then
            json_files_changed+=("$file")
        fi
    done

    # Get any added files by language
    php_files_added=()
    js_files_added=()
    json_files_added=()
    while IFS= read -r -d $'\0' file; do
        if [[ "$file" == *.php ]]; then
            php_files_added+=("$file")
        elif [[ "$file" == *.js ]]; then
            js_files_added+=("$file")
        elif [[ "$file" == *.json ]]; then
            json_files_added+=("$file")
        fi
    done < <(git diff --name-only --diff-filter=A -z "$TRAVIS_COMMIT_RANGE")
fi

# Build tests require the corresponding version of Open XDMoD.
if [ "$TEST_SUITE" = "build" ] || [ "$TEST_SUITE" = "unit" ]; then
    xdmod_branch="$TRAVIS_BRANCH"
    echo "Cloning Open XDMoD branch '$xdmod_branch'"
    git clone --depth=1 --branch="$xdmod_branch" https://github.com/ubccr/xdmod.git ../xdmod

    pushd ../xdmod
    . .travis.install.sh
    popd

    # Create a symlink from Open XDMoD to this module.
    ln -s "$(pwd)" "../xdmod/open_xdmod/modules/$module_dir"
fi

# Perform a test set based on the value of $TEST_SUITE.
build_exit_value=0
if [ "$TEST_SUITE" = "syntax" ]; then
    for file in "${php_files_changed[@]}"; do
        php -l "$file" >/dev/null
        if [ $? != 0 ]; then
            build_exit_value=2
        fi
    done
    for file in "${js_files_changed[@]}"; do
        eslint --no-eslintrc "$file"
        if [ $? != 0 ]; then
            build_exit_value=2
        fi
    done
    for file in "${json_files_changed[@]}" "${json_files_added[@]}"; do
        jsonlint --quiet --compact "$file"
        if [ $? != 0 ]; then
            build_exit_value=2
        fi
    done
elif [ "$TEST_SUITE" = "style" ]; then
    npm install https://github.com/jpwhite4/lint-diff/tarball/master

    for file in "${php_files_changed[@]}"; do
        phpcs "$file" --report=json > "$file.lint.new.json"
        if [ $? != 0 ]; then
            git show "$commit_range_start:$file" | phpcs --stdin-path="$file" --report=json > "$file.lint.orig.json"
            ./node_modules/.bin/lint-diff "$file.lint.orig.json" "$file.lint.new.json"
            if [ $? != 0 ]; then
                build_exit_value=2
            fi
            rm "$file.lint.orig.json"
        fi
        rm "$file.lint.new.json"
    done
    for file in "${php_files_added[@]}"; do
        phpcs "$file"
        if [ $? != 0 ]; then
            build_exit_value=2
        fi
    done
    for file in "${js_files_changed[@]}"; do
        eslint "$file" -f json > "$file.lint.new.json"
        if [ $? != 0 ]; then
            git show "$commit_range_start:$file" | eslint --stdin --stdin-filename "$file" -f json > "$file.lint.orig.json"
            ./node_modules/.bin/lint-diff "$file.lint.orig.json" "$file.lint.new.json"
            if [ $? != 0 ]; then
                build_exit_value=2
            fi
            rm "$file.lint.orig.json"
        fi
        rm "$file.lint.new.json"
    done
    for file in "${js_files_added[@]}"; do
        eslint "$file"
        if [ $? != 0 ]; then
            build_exit_value=2
        fi
    done
elif [ "$TEST_SUITE" = "unit" ]; then
    tests/unit_tests/runtests.sh
    if [ $? != 0 ]; then
        build_exit_value=2
    fi
elif [ "$TEST_SUITE" = "build" ]; then
    # If PHP 5.3.3 is installed, SSL/TLS isn't available to PHP.
    # Use a newer version of PHP for installing Composer dependencies.
    using_php_533="false"; [[ "$(php --version)" == PHP\ 5.3.3\ * ]] && using_php_533="true"
    if "$using_php_533"; then
        echo "Using newer version of PHP for installing dependencies"
        phpenv global 5.3
        php --version
    fi

    echo "Building Open XDMoD..."
    ../xdmod/open_xdmod/build_scripts/build_package.php --module xdmod
    echo "Building $module_name module..."
    ../xdmod/open_xdmod/build_scripts/build_package.php --module "$module_dir"
    if [ $? != 0 ]; then
        build_exit_value=2
    fi

    # If using PHP 5.3.3 for testing purposes, stop using the newer PHP version.
    if "$using_php_533"; then
        echo "Reverting back to PHP 5.3.3 for testing"
        phpenv global 5.3.3
        php --version
    fi

    xdmod_install_dir="$HOME/xdmod-install"

    echo "Installing Open XDMoD..."
    cd ../xdmod/open_xdmod/build || exit 2
    xdmod_tar="$(find . -regex '^\./xdmod-[0-9]+[^/]*\.tar\.gz$')"
    tar -xf "$xdmod_tar"
    cd "$(basename "$xdmod_tar" .tar.gz)" || exit 2
    ./install --prefix="$xdmod_install_dir"

    echo "Installing $module_name module..."
    cd .. || exit 2
    module_tar="$(find . -regex "^\./xdmod-${module_dir}-[0-9]+[^/]*\.tar\.gz$")"
    tar -xf "$module_tar"
    cd "$(basename "$module_tar" .tar.gz)" || exit 2
    ./install --prefix="$xdmod_install_dir"
    if [ $? != 0 ]; then
        build_exit_value=2
    fi

    echo "Installing npm dependencies..."
    pushd "$xdmod_install_dir/share/etl/js" >/dev/null
    npm install
    popd >/dev/null

    echo "Testing ETL configs..."
    cd "$xdmod_install_dir" || exit 2
    cp "$TRAVIS_BUILD_DIR/configuration/supremm_resources.json" etc/
    node share/etl/js/etl.cli.js -t
    if [ $? != 0 ]; then
        build_exit_value=2
    fi
else
    echo "Invalid value for \$TEST_SUITE: $TEST_SUITE" >&2
    build_exit_value=1
fi

exit $build_exit_value
