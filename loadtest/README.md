# Loadtest for plenary server

This directory contains an ansible playbook for spinning up several ec2
instances, installing chromium on them, and pointing the browsers at a running
plenary server instance with video and audio.  This can be used to test the
performance of freeswitch and nginx-rtmp-module under load.

# Usage

First, make sure the contents of `vars/secrets.yml` contains the following necessary secrets:
 - `vault_ec2_key_name`: Name of an SSH keypair for ec2 to install on the servers.
 - `vault_aws_access_key`: Access key for aws.
 - `vault_aws_secret_key`: Secret key for aws.
 - `vault_ec2_security_group_id`: Security access group.  Recommended:
   `"sg-ac3f77d4", which allows SSH/HTTP(S) from anywhere.

Next, tweak settings in `vars/participants.yml` and `vars/listeners.yml` as
needed.  Some key settings you may be interested in:
 - `ec2_instance_type`: e.g. "m4.large" or "t2.nano". Beefier machines can run
   more than one browser profile at once -- m4.large can do 4-5, t2.nano
   sometimes struggles with 1.
 - `ec2_count`: Number of instances to launch. ec2 limits this to 20 unless you
   explicitly request that they raise the limit. So if you want more
   concurrency, you may need to do fewer larger machines with more profiles
   each.
 - `simultaneous_profiles`: List of chrome profiles to create/launch. Should
   contain at least one value.  Performance may suffer if you have to many on a
   t2.nano (I've found any more than 2 participants and 3 listeners to be too
   many for that size).
 - `target_url`: The URL for the profile to hit.

Finally, launch one or more runs using `make`:
 - `make participants`: Launch using `vars/participants.yml` -- bidirectional video and audio, using Chromium's built-in `--use-fake-device-for-media-stream`.
 - `make listeners`: Launch using `vars/listeners.yml` -- read-only video and audio.

To simulate multiple simultaneous conferences, specify the "room" parameter:
```
make room=2 participants
```
This will include vars from `vars/room2.yml`, which specifies the room name
`"test1"`. (We're using vars files in this clunky way because ansible doesn't
support mixing vars files and assignments on the command line).

## Example - launch 4 rooms with 5 participants each:

 1. Set `ec2_count` in `vars/participants.yml` to 5.
 2. Run the following in 4 terminals:

     ```
     # terminal 1
     make room=1 participants
     # terminal 2
     make room=2 participants
     # terminal 3
     make room=3 participants
     # terminal 4
     make room=4 participants
     ```

Finally, observe performance on the target server.  Some [useful
tips](http://techblog.netflix.com/2015/11/linux-performance-analysis-in-60s.html)
for analyzing performance.  You can also connect to the listen or participate
endpoints in a browser to observe the process.
