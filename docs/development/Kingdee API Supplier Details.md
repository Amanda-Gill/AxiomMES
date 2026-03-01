# Kingdee API Supplier Details

### **金蝶API供应商详情接口文档**

# 供应商详情

**更新于**：2025-06-12 21:30

## 基本信息
- **用途说明**：获取供应商详情
- **请求方式**：GET
- **请求地址**：`https://api.kingdee.com/jdy/v2/bd/supplier_detail`

## 请求参数

### Headers 参数
| 参数名称 | 类型 | 是否必填 | 描述 | 示例值 |
| :--- | :--- | :--- | :--- | :--- |
| Content-Type | string | true | 固定传：`application/json` | `application/json` |
| X-Api-ClientID | string | true | 应用ID，[创建指引](https://open.jdy.com/#/files/api/detail?index=3&categrayId=316e1f5bd9d711ed8e36c17691e84ff5&id=a540e3dcd9d811ed8e3677dc79b66e86&noside=true) | `205022` |
| X-Api-Auth-Version | string | true | 固定传：`2.0` | `2.0` |
| X-Api-TimeStamp | string | true | 当前时间的毫秒时间戳，有效期为5分钟 | `1655775240000` |
| X-Api-SignHeaders | string | true | 固定传：`X-Api-TimeStamp,X-Api-Nonce` | `X-Api-TimeStamp,X-Api-Nonce` |
| X-Api-Nonce | string | true | 随机正整数 | `1655775240000` |
| X-Api-Signature | string | true | 签名，[参考加密规则](https://open.jdy.com/#/files/api/detail?index=3&categrayId=5403e0fd6a5811eda819b759130d6d33&id=b5c26557da9d11ed8e36f9799578d2e1&noside=true) | `xxx` |
| app-token | string | true | 产品账套级别的token，[获取指引](https://open.jdy.com/#/files/api/detail?index=3&categrayId=5403e0fd6a5811eda819b759130d6d33&id=9076d1a6da9d11ed8e36874bed64e0be&noside=true) | `xxx` |
| X-GW-Router-Addr | string | true | IDC域名，获取appKey返回消息体内的domain字段 | `https://tf.jdy.com` |

### Query 参数 (Params)
| 参数名称 | 类型 | 是否必填 | 描述 |
| :--- | :--- | :--- | :--- |
| id | string | false | 供应商ID，与`number`二选一 |
| number | string | false | 供应商编码，与`id`二选一 |

### 请求示例
```bash
curl --location --request GET 'https://api.kingdee.com/jdy/v2/bd/supplier_detail?id=1&number=001' \
--header 'Content-Type: application/json' \
--header 'X-Api-ClientID: 205022' \
--header 'X-Api-Auth-Version: 2.0' \
--header 'X-Api-TimeStamp: 1655775240000' \
--header 'X-Api-Nonce: 1655775240000' \
--header 'X-Api-SignHeaders: X-Api-TimeStamp,X-Api-Nonce' \
--header 'X-Api-Signature: xxx' \
--header 'app-token: xxx' \
--header 'X-GW-Router-Addr: https://tf.jdy.com'
```

## 响应参数

### 响应体
| 参数名称 | 类型 | 描述 |
| :--- | :--- | :--- |
| errcode | integer | 返回码，成功时为0 |
| description | string | 返回信息，成功时为“success”，失败时为具体信息 |
| data | [Data](#data) | 业务返回的具体对象 |

### Data
| 参数名称 | 类型 | 描述 |
| :--- | :--- | :--- |
| id | string | 供应商ID |
| account_entity | List\<[AccountEntity](#accountentity)\> | 银行信息列表 |
| bom_entity | List\<[Bomentity](#bomentity)\> | 联系人信息列表 |
| custom_field | Map\<string\> | 自定义字段，[使用指南](https://open.jdy.com/#/files/api/detail?id=76567ff2a06311edaa4b3d71bf0fce53&noside=true) |
| deduct | boolean | 是否自动抵扣预收款 |
| enable | string | 可用状态（1：可用，0：不可用） |
| group_name | string | 分类名称 |
| name | string | 供应商名称 |
| number | string | 供应商编码 |
| remark | string | 备注 |
| sale_dept_name | string | 采购员部门 |
| saler_name | string | 采购员姓名 |
| taxpayer_no | string | 开票税号 |

### Bomentity
| 参数名称 | 类型 | 描述 |
| :--- | :--- | :--- |
| birthday | string | 生日，[敏感数据解密](https://open.jdy.com/#/files/api/detail?id=d7046d818dc111ee860d0fedad361070&noside=true) |
| contact_address | string | 地址，[敏感数据解密](https://open.jdy.com/#/files/api/detail?id=d7046d818dc111ee860d0fedad361070&noside=true) |
| contact_city_id | string | 市ID |
| contact_city_name | string | 市名称 |
| contact_city_number | string | 市编码 |
| contact_country_id | string | 国家ID |
| contact_country_name | string | 国家名称 |
| contact_country_number | string | 国家编码 |
| contact_district_id | string | 区ID |
| contact_district_name | string | 区名称 |
| contact_district_number | string | 区编码 |
| contact_person | string | 联系人名称 |
| contact_province_id | string | 省ID |
| contact_province_name | string | 省名称 |
| contact_province_number | string | 省编码 |
| email | string | 邮箱，[敏感数据解密](https://open.jdy.com/#/files/api/detail?id=d7046d818dc111ee860d0fedad361070&noside=true) |
| gender | string | 性别（1：男，2：女） |
| group_number | string | 分类编码 |
| id | string | 分录ID |
| is_default_linkman | boolean | 是否首要联系人 |
| mobile | string | 手机，[敏感数据解密](https://open.jdy.com/#/files/api/detail?id=d7046d818dc111ee860d0fedad361070&noside=true) |
| phone | string | 座机，[敏感数据解密](https://open.jdy.com/#/files/api/detail?id=d7046d818dc111ee860d0fedad361070&noside=true) |
| qq | string | QQ，[敏感数据解密](https://open.jdy.com/#/files/api/detail?id=d7046d818dc111ee860d0fedad361070&noside=true) |
| rate | string | 税率 |
| seq | string | 联系人序号 |
| wechat | string | 微信，[敏感数据解密](https://open.jdy.com/#/files/api/detail?id=d7046d818dc111ee860d0fedad361070&noside=true) |

### AccountEntity
| 参数名称 | 类型 | 描述 |
| :--- | :--- | :--- |
| acct_is_default | boolean | 是否默认账户 |
| income_acc_name | string | 账户名称 |
| income_acc_no | string | 银行账号，[敏感数据解密](https://open.jdy.com/#/files/api/detail?id=d7046d818dc111ee860d0fedad361070&noside=true) |
| income_bank_code | string | 开户行号，[敏感数据解密](https://open.jdy.com/#/files/api/detail?id=d7046d818dc111ee860d0fedad361070&noside=true) |
| income_bank_name | string | 开户银行 |

### 响应示例
```json
{
	"data":{
		"account_entity":[
			{
				"acct_is_default":true,
				"income_acc_name":"张三",
				"income_acc_no":"001",
				"income_bank_code":"001",
				"income_bank_name":"中国测试银行"
			}
		],
		"bom_entity":[
			{
				"birthday":"2020-03-23",
				"contact_address":"大门",
				"contact_city_id":"1",
				"contact_city_name":"深圳市",
				"contact_city_number":"001",
				"contact_country_id":"1000001",
				"contact_country_name":"中国",
				"contact_country_number":"001",
				"contact_district_id":"1",
				"contact_district_name":"宝安区",
				"contact_district_number":"001",
				"contact_person":"张三",
				"contact_province_id":"1",
				"contact_province_name":"广东省",
				"contact_province_number":"001",
				"email":"xxx@qq.com",
				"gender":"1",
				"group_number":"001",
				"id":"1",
				"is_default_linkman":true,
				"mobile":"13005443543",
				"phone":"25776639",
				"qq":"345991905",
				"rate":"1",
				"seq":"1",
				"wechat":"text"
			}
		],
		"custom_field":{},
		"deduct":9,
		"enable":"1",
		"group_name":"001",
		"id":"1",
		"name":"名称",
		"number":"001",
		"remark":"备注",
		"sale_dept_name":"测试部门",
		"saler_name":"张三",
		"taxpayer_no":"001"
	},
	"description":"success",
	"errcode":0
}
```

## 返回码
| 返回码 | 描述 | 解决方案 |
| :--- | :--- | :--- |
| [公告返回码](https://open.jdy.com/#/files/api/detail?index=2&categrayId=1f51c576013945e2af68ef15d4245a48&id=525e704824d24b178ab466530456c037) | 公告返回码 | - |
| 2000002000 | 系统错误，请到开发者社区提单反馈 | [开发者社区](https://vip.kingdee.com/developer?productLineId=29) |

---