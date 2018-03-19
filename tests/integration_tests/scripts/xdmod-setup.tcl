#!/usr/bin/env expect
# Expect script that runs xdmod-setup to configure the SUPReMM settings on
# a fresh XDMoD instance. This script will fail if run against an already installed
# XDMoD.

#-------------------------------------------------------------------------------
# Helper functions

proc selectMenuOption { option } {
	
	expect {
		-re "\nSelect an option .*: "
	}
	send $option\n
}

proc answerQuestion { question response } {
	expect {
		timeout { send_user "\nFailed to get prompt\n"; exit 1 }
		-re "\n$question \\\[.*\\\] "
	}
	send $response\n
}

proc provideInput { prompt response } {
	expect {
		timeout { send_user "\nFailed to get prompt\n"; exit 1 }
		"\n$prompt "
	}
	send $response\n
}

proc providePassword { prompt password } {
	provideInput $prompt $password
	provideInput "(confirm) $prompt" $password

}

proc enterToContinue { } {
	expect {
		timeout { send_user "\nFailed to get prompt\n"; exit 1 }
		"\nPress ENTER to continue*"
	}
	send \n
}

proc confirmFileWrite { response } {
	expect {
		timeout { send_user "\nFailed to get prompt\n"; exit 1 }
		-re "\nOverwrite config file .*\\\[.*\\\] "
	}
	send $response\n
}

#-------------------------------------------------------------------------------
# main body - note there are some hardcoded addresses, usernames and passwords here
# they should typically not be changed as they need to match up with the
# settings in the docker container

set timeout 10
spawn "xdmod-setup"

selectMenuOption 8

selectMenuOption d
answerQuestion {DB Admin Username:} root
providePassword {DB Admin Password:} {}
provideInput {Install Node.js packages using npm*} {y}
provideInput {MongoDB uri*} {mongodb://localhost:27017/supremm}
provideInput {database name*} {supremm}
enterToContinue
set timeout 200
provideInput {Do you want to see the output*} {no}
set timeout 10

selectMenuOption r
for {set i 1} {$i < 6} {incr i} {
       selectMenuOption $i
       answerQuestion {Enabled \(yes, no\)} {yes}
       answerQuestion {Dataset mapping} {pcp}
       provideInput {GPFS mount point (leave empty if no GPFS)} {gpfs0}
}
selectMenuOption s
confirmFileWrite yes
enterToContinue
selectMenuOption q

selectMenuOption q
