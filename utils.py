# -*- coding=UTF-8 -*-

import os
import requests
import bs4
import json
from datetime import datetime as dt
from jinja2 import Template


def get_weibo_top_search():
    '''
    爬虫模块
    返回r，即网页源码
    '''

    url = "https://s.weibo.com/top/summary?cate=realtimehot"
    headers = {
        'Host': 's.weibo.com',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive',
        'Referer': 'https://weibo.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36',
        "Cookie": "SUB=_2AkMWJrkXf8NxqwJRmP8SxWjnaY12zwnEieKgekjMJRMxHRl-yj9jqmtbtRB6PaaX-IGp-AjmO6k5cS-OH2X9CayaTzVD",
    }
    try:
        r = requests.get(url, headers=headers, timeout=10)
        return r
    except:
        return 0


def data_processing(r):
    '''
    数据处理模块
    返回data，即｛标题：热度｝字典
    '''

    current_data = []
    html_xpath = bs4.BeautifulSoup(r.text, 'html.parser')
    https = html_xpath.find_all('td', attrs={'class': 'td-02'})
    for i in range(len(https)):
        text = https[i].text.split('\n')
        contents = https[i].contents
        contents.remove('\n')
        attrs = contents[0].attrs
        if 'href_to' in attrs:
            url = attrs.get('href_to')
        else:
            url = attrs.get('href')
        result = {
            'title': text[1],
            'hot': text[2],
            'url': f'https://s.weibo.com/{url}'
        }
        current_data.append(result)
    file_name = dt.now().strftime('%Y%m%d')
    bk_json_path = make_path(f'./raw/{file_name}.json')
    if os.path.exists(bk_json_path):
        with open(bk_json_path, 'r', encoding='utf-8') as f:
            before_data = json.load(f)
            current_data = merge_data(current_data, before_data)
    # update json
    write_json_file(current_data, bk_json_path)
    #  update archives
    path = dt.now().strftime('%Y%m%d')
    generate_html(f'./archives/{path}.html', current_data)
    #  update index.html
    generate_html('./index.html', current_data)


def merge_data(current_data, before_data):
    '''
    当前数据和通过的数据通过URL作为唯一标识进行merge
    param:current_data 当前数据
    param:before_data 过去的数据
    '''
    tmp_obj = {}
    merged_data = current_data + before_data
    for data in merged_data:
        tmp_obj[data.get('url')] = f'{data.get("title")}\n{data.get("hot")}'
    after_data = [{'title': tmp_obj.get(url).split('\n')[0], 'hot':tmp_obj.get(url).split('\n')[
        1], 'url':url} for url in tmp_obj]
    return after_data


def make_path(path):
    '''
    路径生成模块
    '''
    paths = path.split('/')
    paths.remove('.')
    if len(paths) > 1 and not os.path.exists('/'.join(paths[:-1])):
        os.makedirs('/'.join(paths[:-1]))
    return path


def write_json_file(data, path):
    '''
    写入文件模块
    '''
    jsonstr = json.dumps(data, indent=4, ensure_ascii=False)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(jsonstr)


def generate_html(path, contents):
    '''
    生成 HTML 文件
    param:path 文件路径
    param:contents 热搜结果
    '''

    template = Template('''
    <!DOCTYPE html>
    <html lang='zh'>
        <head>
        <title>微博知乎热搜新闻 - 热门话题排行榜</title>
        <meta content="微博知乎热搜新闻 - 热门话题排行榜" property="og:title">
        <meta name="description" content="查看微博和知乎上的热门话题排行榜。">
        <meta property="og:description" content="查看微博和知乎上的热门话题排行榜。">
        <meta name="twitter:description" content="查看微博和知乎上的热门话题排行榜。">
        <meta name="keywords" content="微博,知乎,热搜,热门话题,排行榜">
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, user-scalable=yes">
        <meta content="IE=edge" http-equiv="X-UA-Compatible">
        <meta content="max-snippet:-1, max-image-preview:large, max-video-preview:-1" name="robots">
        <meta content="#598cff" name="theme-color">
        <meta content="telephone=no" name="format-detection">
        <meta content="text/html; charset=UTF-8" http-equiv="Content-Type">
        <meta content="summary_large_image" name="twitter:card">
        <meta content="@Seiriryu" name="twitter:site">
        <meta content="@Seiriryu" name="twitter:creator">
        <link rel="icon" href="./static/favicon.png">
        <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 16px;
            background-image: url('./static/background.jpg');
            background-size: cover;
            background-position: center;
        }
        h1 {
            text-align: center;
            margin-top: 40px;
            color: white;
            text-shadow: 2px 2px 4px #000000;
            font-size: 36px;
            font-weight: bold;
        }
        ul {
            list-style-type: none;
            padding: 0;
            margin: 40px auto;
            width: 80%;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
        }
        li {
            width: 30%;
            margin-bottom: 20px;
            padding: 20px;
            background-color: rgba(255, 255, 255, 0.8);
            text-align: center;
            border-radius: 10px;
            box-shadow: 2px 2px 4px #000000;
            color: black;
            font-size: 20px;
            font-weight: bold;
            transition: all 0.5s;
        }
        li:hover {
            transform: scale(1.1);
            box-shadow: 4px 4px 8px #000000;
            cursor: pointer;
        }

        @media screen and (max-width: 959px) {
            li {
                width: 80%;
            }
        }
        @media screen and (max-width: 480px) {
            li {
                width: 80%;
            }
        }
        </style>
        <!-- Google tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-E4CG1XRFV6"></script>
        <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-E4CG1XRFV6');
        </script>
        </head>
        <body>
            <h1>微博和知乎热搜</h1>
            <div>
            <ul>
                <a href='./archive.html' rel='follow' target='_blank'>历史热搜</a>
            </ul>
            <ul>
            {% for item in contents %}
                <li><a href='{{ item.url }}' rel='nofollow' target='_blank'>{{ item.title }}</a></li>
            {% endfor %}
            </ul>
            </div>
        </body>
    </html>
    ''')
    html = template.render(contents=contents)
    make_path(path)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
