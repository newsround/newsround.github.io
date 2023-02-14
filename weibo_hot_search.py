# -*- coding=UTF-8 -*-

from utils import *


def main():
    '''
    主函数
    '''
    r = get_weibo_top_search()
    if r:
        data_processing(r)
        print('获取热搜完毕，三秒后关闭…')
    else:
        print('爬虫失败，检查网络')


if __name__ == '__main__':
    main()
