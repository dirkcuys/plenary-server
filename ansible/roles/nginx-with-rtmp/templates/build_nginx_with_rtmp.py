#!/usr/bin/env python3

import os
import subprocess

NGINX_RTMP_GIT_URL = "https://github.com/sergey-dryabzhinsky/nginx-rtmp-module.git"

def check_changed(command, changed_func, changed):
    if isinstance(command, str):
        command = command.split()
    output = subprocess.check_output(command)
    result = changed_func(output)
    return result or changed

def fetch_git_repo(url, branch, dest):
    pass

def main():
    changed = False

    def _apt_changed(stdout):
        return "0 upgraded, 0 newly installed, 0 to remove" not in stdout

    def _git_changed(stdout):
        pass

    changed = check_changed("apt-get autoremove nginx", _apt_changed, changed)
    changed = check_changed("apt-get install dpkg-dev build-essential libav-tools",
            _apt_changed, changed)



    if os.path.exists("/usr/src/nginx-rtmp-module/.git"):
        pass

    # FIXME:  This isn't finished.
