# !/usr/bin/python
# -*- coding: utf-8 -*-
#
# LaunchBar Action Script
#

"""Spotify to Douban"""

import subprocess
import urllib2
import json
from urllib import urlencode

SEARCH_API = 'https://api.douban.com/v2/music/search?'


def generate(applescript):
    """Generate subprocess run applescript list"""
    command = ['osascript', '-e', applescript]
    return command


def run_script(script):
    """Rune applescript"""
    try:
        response = subprocess.check_output(generate(script))
    except:
        return None

    data = response.decode('utf-8')

    if data.endswith('\n'):
        data = data.rstrip('\n')

    return data


def get_track():
    """Get current playing track name"""
    script = (
        'tell application "Spotify" to name of current track as string'
    )

    return run_script(script)


def get_artist():
    """Get current playing track artist"""
    script = (
        'tell application "Spotify" to artist of current track as string'
    )

    return run_script(script)


def get_album():
    """Get current playing track album"""
    script = (
        'tell application "Spotify" to album of current track as string'
    )

    return run_script(script)


def search_douban(album, artist):
    """搜索豆瓣获取项目链接"""
    info = album + ' ' + artist if artist else album
    queries = {
        'q': info.encode('utf-8'),
        'start': '0',
        'count': '1'
    }

    print(SEARCH_API + urlencode(queries))
    try:
        resp = urllib2.urlopen(SEARCH_API + urlencode(queries))
        raw_html = resp.read()
    except:
        return None

    resp_data = json.loads(raw_html)

    music_infos = resp_data.get('musics')

    if not music_infos:
        return None

    music_info = music_infos[0]

    douban_url = music_info.get('alt', 'https://douban.com/music')

    return douban_url


def open_url(douban_url):
    subprocess.call(['open', str(douban_url)])


current_album = get_album()
current_artist = get_artist()
douban_url = search_douban(current_album, current_artist)

if not douban_url:
    script = 'display notification with title "Spotify" subtitle "Can\'t find {} - {} at Douban"'.format(current_artist, current_album)
    subprocess.call(['osascript', '-e', script])
else:
    open_url(search_douban(current_album, current_artist))
