# -*- coding=UTF-8 -*-

import os
import requests
import bs4
import json
from datetime import datetime as dt
from jinja2 import Template


def get_weibo_top_search():
    url = "https://s.weibo.com/top/summary?cate=realtimehot"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36',
        "Cookie": "SUB=_2AkMWJrkXf8NxqwJRmP8SxWjnaY12zwnEieKgekjMJRMxHRl-yj9jqmtbtRB6PaaX-IGp-AjmO6k5cS-OH2X9CayaTzVD",
    }

    current_data = []
    response = requests.get(url, headers=headers, timeout=10)
    html_xpath = bs4.BeautifulSoup(response.text, 'html.parser')
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
        current_data.append({
            'title': text[1],
            'hot': text[2],
            'url': f'https://s.weibo.com/{url}'
        })
    data_handler(current_data)


def get_zhihu_top_search():
    url = "https://www.zhihu.com/api/v4/search/top_search"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36',
    }

    current_data = []
    response = requests.get(url, headers=headers, timeout=10)
    words = json.loads(response.text).get('top_search').get('words')
    for word in words:
        current_data.append({
            'title': word.get('display_query'),
            'hot': '',
            'url': f'https://www.zhihu.com/search?q={word.get("query")}'
        })
    data_handler(current_data)


def get_zhihu_top_vieo():
    url = "https://www.zhihu.com/api/v3/feed/topstory/hot-lists/zvideo?limit=100"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36',
    }

    current_data = []
    response = requests.get(url, headers=headers, timeout=10)
    targets = json.loads(response.text).get('data')
    for item in targets:
        current_data.append({
            'title': item.get('target').get('title'),
            'hot': '',
            'url': item.get('target').get('url')
        })
    data_handler(current_data)


def get_zhihu_top_question():
    url = "https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=100"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36',
    }

    current_data = []
    response = requests.get(url, headers=headers, timeout=10)
    targets = json.loads(response.text).get('data')
    for item in targets:
        current_data.append({
            'title': item.get('target').get('title'),
            'hot': '',
            'url': f'https://www.zhihu.com/question/{item.get("target").get("id")}'
        })
    data_handler(current_data)


def data_handler(current_data):
    '''
    数据处理模块
    param:current_data 现在的数据
    '''
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
    make_index_html(f'./archives/{path}.html', current_data)
    #  update index.html
    make_index_html('./index.html', current_data)


def merge_data(current_data, before_data):
    '''
    当前数据和通过的数据通过URL作为唯一标识进行merge
    param:current_data 当前数据
    param:before_data 过去的数据
    '''
    tmp_obj = {}
    merged_data = current_data + before_data
    for data in merged_data:
        tmp_obj[data.get('title')] = f'{data.get("url")}\n{data.get("hot")}'
    after_data = [{'title': title, 'url': tmp_obj.get(title).split('\n')[0], 'hot':tmp_obj.get(title).split('\n')[
        1]} for title in tmp_obj]
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




def make_index_html(path, contents):
    '''
    生成  index HTML 文件
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
                <a href='https://newsround.github.io/archive.html' rel='follow' target='_blank'>历史热搜</a>
            </ul>
            <ul>
            {% for item in contents %}
                {% if item.hot %}
                    <li><a href='{{ item.url }}' rel='nofollow' target='_blank'>{{ item.title }}({{ item.hot }})</a></li>
                {% else %}
                    <li><a href='{{ item.url }}' rel='nofollow' target='_blank'>{{ item.title }}</a></li>
                {% endif %}
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


def make_archives_html():
    '''
    生成 archives HTML 文件
    param:path 文件路径
    param:contents 热搜结果
    '''

    template = Template('''
    <!DOCTYPE html>
    <html lang='zh'>
        <head>
        <title>历史微博知乎热搜新闻 - 热门话题排行榜</title>
        <meta content="历史微博知乎热搜新闻 - 热门话题排行榜" property="og:title">
        <meta name="description" content="查看历史微博和知乎上的热门话题排行榜。">
        <meta property="og:description" content="查看历史微博和知乎上的热门话题排行榜。">
        <meta name="twitter:description" content="查看历史微博和知乎上的热门话题排行榜。">
        <meta name="keywords" content="微博,知乎,热搜,热门话题,排行榜,历史新闻">
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
            <h1>历史微博和知乎热搜</h1>
            <div>
            <ul>
            {% for item in archives %}
                <li><a href='{{ item.url }}' rel='follow' target='_blank'>{{ item.title }}</a></li>
            {% endfor %}
            </ul>
            </div>
        </body>
    </html>
    ''')
    files = os.listdir('./archives')
    files.remove('static')
    archives = []
    for file_name in files:
        archives.append({
           'title': dt.strptime(file_name[:-5], '%Y%m%d').strftime('%Y-%m-%d') ,
            'url': f'./archives/{file_name}'
        })
    html = template.render(archives=archives)
    with open('./archive.html', 'w', encoding='utf-8') as f:
        f.write(html)