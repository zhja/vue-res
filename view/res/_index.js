import Header from 'components/Header';
import Res from 'components/Res';
module.exports = {
	components: {
		Header,
		Res,
	},
	data() {
		return {
			res_config: {
				'tools': {
					'showField': {
			            'text': "显示字段",
			            'icon': 'setting'
			        },
					'search': {
			            'text': "高级查询",
			            'icon': 'search'
			        },
			        'batchSearch': {
			            'text': "批量查询",
			            'icon': 'view'
			        },
					'add': {
			            'text': "添加",
			            'icon': 'plus'
			        },
			        'import': {
			            'text': "导入",
			            'icon': 'upload',
			            'msg': {
			                '1': '必选字段: 名称,中文名,IP转换规则(取值128/65536) （均不允许重复)',
			            },
			        },
			        // 'edit': {
			        //     'text': "更新",
			        //     'icon': 'edit',
			        //     'msg': {
			        //         '1': 'ID不允许为空',
			        //     },
			        // },
			        'delete': {
			            'text': "删除",
			            'icon': 'delete2',
			        },
			        // 'export': {
			        //     'text': '导出',
			        //     'icon': 'upload2',
			        // },
			        'refresh': {
			            'text': "刷新",
			            'icon': 'loading'
			        }
				},
				'add': {
			        'name': {
			            'type': 'input',
			        },
			        'parent_id': {
			            'type': 'input',
			        },
			        'type': {
			            'type': 'input',
			        },
			        'sleep': {
			            'type': 'input',
			        },
			        'api': {
			            'type': 'input',
			        },
			        'callback_api': {
			            'type': 'input',
			        },
			        'status_id': {
			            'type': 'input',
			        },
			    },
			    'edit': {
			        'name': {
			            'type': 'input',
			        },
			        'parent_id': {
			            'type': 'input',
			        },
			        'type': {
			            'type': 'input',
			        },
			        'sleep': {
			            'type': 'input',
			        },
			        'api': {
			            'type': 'input',
			        },
			        'callback_api': {
			            'type': 'input',
			        },
			        'status_id': {
			            'type': 'input',
			        },
			    },
			    'query': {
		            'columns': 4, // 4列 = 24/6
		            'items': {
		                'id': {
		                    'type': 'input',
		                    'cond': '',
		                },
		                'name': {
		                    'type': 'input',
		                    'cond': 'like',
		                },
		                'parent_id': {
		                    'type': 'input',
		                    'cond': 'like',
		                },
		                'type': {
		                    'type': 'input',
		                    'cond': 'like',
		                },
		                'sleep': {
		                    'type': 'input',
		                    'cond': 'like',
		                },
		                'api': {
		                    'type': 'input',
		                    'cond': 'like',
		                },
		                'callback_api': {
		                    'type': 'input',
		                    'cond': '',
		                },
		                'status_id': {
		                    'type': 'input',
		                    'cond': '',
		                },
		            },
		        },
		        'set_column': {
		            'base_info': {
		                'text': '基本信息',
		                'column': ['name', 'type', 'sleep', 'api', 'status_id']
		            },
		            'extra_info': {
		                'text': '额外信息',
		                'column': ['parent_id', 'callback_api'],
		            },
		        },
				'columns_config': {
					'id': "ID",
					'name': "名称", 
					'parent_id': "父级",
					'type': "类型",
					'sleep': "心跳",  
					'api': "API",
					'callback_api': "回调API",
					'status_id': "状态"
				},
				'default_columns': ['id', 'name', 'parent_id', 'type', 'sleep', 'api', 'callback_api', 'status_id'],
				'api_url': {
					//key值固定不可修改
					'list': {
						'url': 'http://192.168.210.130:8015/mqtype/list'
					},//获取列表
					'add': 'http://192.168.210.130:8011/res/add',//保存信息
					'edit': 'http://192.168.210.130:8011/res/edit',//更新信息
					'info': 'http://192.168.210.130:8011/res/info',//获取详情
					'batch': 'http://192.168.210.130:8011/res/batch',//批量导入
					'delete': 'http://192.168.210.130:8011/res/delete',//删除
				},
				'select': {
					'isCDN': ['是', '否'],
				}
			},
	    }
	}
}