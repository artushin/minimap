#!/bin/bash
pgrep -x Xvfb > /dev/null && (pgrep chrome > /dev/null || pgrep ffmpeg > /dev/null)