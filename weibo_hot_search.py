# -*- coding=UTF-8 -*-

from utils import *


def main():
    '''
    主函数
    '''
    try:
        get_zhihu_top_search()
        get_weibo_top_search()
        get_zhihu_top_question()
        get_zhihu_top_vieo()
    except Exception as e:
        print(e)

if __name__ == '__main__':
    main()
