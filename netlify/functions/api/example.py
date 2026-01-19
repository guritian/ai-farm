"""
示例 API
演示如何使用 Supabase Helper 进行数据库操作
"""

import json
from datetime import datetime
import sys
import os

# 添加 utils 目录到 Python 路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from utils.supabase_helper import get_supabase_helper


def handler(event, context):
    """
    Netlify Function 处理函数
    
    Args:
        event: 请求事件对象
        context: 上下文对象
        
    Returns:
        Dict: HTTP 响应
    """
    try:
        # 获取请求方法
        http_method = event.get('httpMethod', 'GET')
        
        # 获取 Supabase helper
        supabase = get_supabase_helper()
        
        # 示例：返回一些演示数据
        # 注意：这里使用硬编码数据，实际项目中应该查询真实的表
        sample_data = {
            'message': '这是一个示例 API',
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'method': http_method,
            'examples': [
                {
                    'id': 1,
                    'title': 'AI 工具示例',
                    'description': '使用 AI 进行文本生成'
                },
                {
                    'id': 2,
                    'title': '知识科普示例',
                    'description': '深入理解神经网络'
                }
            ]
        }
        
        # 如果需要查询真实数据，可以使用：
        # result = supabase.select('your_table_name', limit=10)
        # if result['error']:
        #     raise Exception(result['error'])
        # sample_data['database_data'] = result['data']
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps(sample_data, ensure_ascii=False)
        }
        
    except Exception as e:
        # 错误处理
        error_response = {
            'error': {
                'type': type(e).__name__,
                'message': str(e)
            },
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(error_response, ensure_ascii=False)
        }
