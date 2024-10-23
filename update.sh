#!/bin/bash
# needs jq, curl, awk and sed

set -e

branches="xdmod11.0 xdmod10.5 xdmod10.0"
latest="xdmod10.5"

SED=sed
if command -v gsed > /dev/null;
then
    SED=gsed
fi

for branch in $branches;
do
    version=${branch:5}
    filelist=$(git ls-tree --name-only -r upstream/$branch docs | egrep '.*\.md$')
    for file in $filelist;
    do
        outfile=$(echo $file | awk 'BEGIN{FS="/"} { for(i=2; i < NF; i++) { printf "%s/", $i } print "'$version'/" $NF}')
        mkdir -p $(dirname $outfile)
        sedscript='/^redirect_from:$/{N;s/^redirect_from:\n    - ""/redirect_from:\n    - "\/'$version'\/"/}'
        if [ "$branch" = "$latest" ]; then
            sedscript='/^redirect_from:$/a\    - "\/'$version'\/"'
            basefile=$(basename $outfile .md)
            if [ "docs/${basefile}.md" = "$file" ]; then
                cat > ${basefile}.md << EOF
---
redirect_to: /$version/${basefile}.html
---
EOF
            fi
        fi
        git show refs/remotes/upstream/$branch:$file | $SED "$sedscript" > $outfile
    done
done
