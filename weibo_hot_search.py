# -*- coding=UTF-8 -*-

from utils import *
import logging

logger = logging.getLogger('log')

def main():
    try:
        get_zhihu_top_search()
        get_weibo_top_search()
        get_zhihu_top_question()
        get_zhihu_top_vieo()
        make_archives_html()
    except Exception as e:
        logger.exception(e)

if __name__ == '__main__':
    main()
