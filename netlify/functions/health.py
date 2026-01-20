"""
健康检查 API
返回系统状态和数据库连接信息
"""

import json
from datetime import datetime
import sys
import os

# 添加当前目录到 Python 路径
sys.path.insert(0, os.path.dirname(__file__))

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
        # 获取 Supabase helper
        supabase = get_supabase_helper()
        
        # 测试数据库连接
        db_status = supabase.test_connection()
        
        # 构建响应
        response_data = {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'database': {
                'connected': db_status.get('connected', False),
                'message': db_status.get('message', '')
            }
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': json.dumps(response_data, ensure_ascii=False)
        }
        
    except Exception as e:
        # 错误处理
        error_response = {
            'status': 'error',
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'error': {
                'type': type(e).__name__,
                'message': str(e)
            }
        }
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(error_response, ensure_ascii=False)
        }
