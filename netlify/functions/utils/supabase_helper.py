"""
Supabase 工具类
提供 Supabase 连接和常用数据库操作的封装
"""

import os
from supabase import create_client, Client
from typing import Optional, Dict, Any, List


class SupabaseHelper:
    """Supabase 辅助类"""
    
    def __init__(self):
        """初始化 Supabase 客户端"""
        self.url = os.environ.get('SUPABASE_URL')
        self.service_key = os.environ.get('SUPABASE_SERVICE_KEY')
        
        if not self.url or not self.service_key:
            raise ValueError(
                "缺少 Supabase 配置。请在 Netlify 环境变量中设置 "
                "SUPABASE_URL 和 SUPABASE_SERVICE_KEY"
            )
        
        self.client: Client = create_client(self.url, self.service_key)
    
    def test_connection(self) -> Dict[str, Any]:
        """
        测试数据库连接
        
        Returns:
            Dict: 包含连接状态的字典
        """
        try:
            # 尝试查询系统表
            response = self.client.table('_supabase_migrations').select('*').limit(1).execute()
            return {
                'connected': True,
                'message': 'Supabase 连接成功'
            }
        except Exception as e:
            return {
                'connected': False,
                'message': f'连接失败: {str(e)}'
            }
    
    def select(
        self, 
        table: str, 
        columns: str = '*', 
        filters: Optional[Dict[str, Any]] = None,
        limit: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        查询数据
        
        Args:
            table: 表名
            columns: 要查询的列（默认 '*'）
            filters: 过滤条件字典，例如 {'id': 1, 'status': 'active'}
            limit: 限制返回结果数量
            
        Returns:
            Dict: 包含 data 和 error 的字典
        """
        try:
            query = self.client.table(table).select(columns)
            
            # 应用过滤条件
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            
            # 应用限制
            if limit:
                query = query.limit(limit)
            
            response = query.execute()
            return {
                'data': response.data,
                'error': None
            }
        except Exception as e:
            return {
                'data': None,
                'error': str(e)
            }
    
    def insert(self, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        插入数据
        
        Args:
            table: 表名
            data: 要插入的数据字典
            
        Returns:
            Dict: 包含 data 和 error 的字典
        """
        try:
            response = self.client.table(table).insert(data).execute()
            return {
                'data': response.data,
                'error': None
            }
        except Exception as e:
            return {
                'data': None,
                'error': str(e)
            }
    
    def update(
        self, 
        table: str, 
        data: Dict[str, Any],
        filters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        更新数据
        
        Args:
            table: 表名
            data: 要更新的数据字典
            filters: 过滤条件
            
        Returns:
            Dict: 包含 data 和 error 的字典
        """
        try:
            query = self.client.table(table).update(data)
            
            for key, value in filters.items():
                query = query.eq(key, value)
            
            response = query.execute()
            return {
                'data': response.data,
                'error': None
            }
        except Exception as e:
            return {
                'data': None,
                'error': str(e)
            }
    
    def delete(self, table: str, filters: Dict[str, Any]) -> Dict[str, Any]:
        """
        删除数据
        
        Args:
            table: 表名
            filters: 过滤条件
            
        Returns:
            Dict: 包含 data 和 error 的字典
        """
        try:
            query = self.client.table(table).delete()
            
            for key, value in filters.items():
                query = query.eq(key, value)
            
            response = query.execute()
            return {
                'data': response.data,
                'error': None
            }
        except Exception as e:
            return {
                'data': None,
                'error': str(e)
            }


# 创建全局实例（延迟初始化）
_supabase_helper: Optional[SupabaseHelper] = None


def get_supabase_helper() -> SupabaseHelper:
    """
    获取 Supabase Helper 单例实例
    
    Returns:
        SupabaseHelper: Supabase 辅助类实例
    """
    global _supabase_helper
    
    if _supabase_helper is None:
        _supabase_helper = SupabaseHelper()
    
    return _supabase_helper
