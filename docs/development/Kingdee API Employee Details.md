# Kingdee API Employee Details

### **金蝶API职员详情接口文档**

# 职员详情

**更新于**：2024-11-07 21:53

## 基本信息
- **用途说明**：获取职员详情
- **请求方式**：GET
- **请求地址**：`https://api.kingdee.com/jdy/v2/bd/emp_detail`

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
| id | string | false | 职员ID，与`number`二选一 |
| number | string | false | 职员编码，与`id`二选一 |

### 请求示例
```bash
curl --location --request GET 'https://api.kingdee.com/jdy/v2/bd/emp_detail?id=1&number=001' \
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
| id | string | 职员ID |
| birthday | string | 生日，[敏感数据解密](https://open.jdy.com/#/files/api/detail?id=d7046d818dc111ee860d0fedad361070&noside=true) |
| department_id | string | 部门ID |
| department_name | string | 部门名称 |
| department_number | string | 部门编码 |
| email | string | 邮箱，[敏感数据解密](https://open.jdy.com/#/files/api/detail?id=d7046d818dc111ee860d0fedad361070&noside=true) |
| enable | string | 可用状态（1：可用，0：不可用） |
| gender | integer | 性别（1：男，0：女） |
| hire_date | string | 入职日期 |
| id_number | string | 证件号，[敏感数据解密](https://open.jdy.com/#/files/api/detail?id=d7046d818dc111ee860d0fedad361070&noside=true) |
| leave_date | string | 离职日期 |
| mobile | string | 手机号，[敏感数据解密](https://open.jdy.com/#/files/api/detail?id=d7046d818dc111ee860d0fedad361070&noside=true) |
| name | string | 职员名称 |
| number | string | 职员编码 |
| settle_bank_id | string | 结算账户ID |
| settle_type_id | string | 结算类型ID |
| wechat | string | 微信号，[敏感数据解密](https://open.jdy.com/#/files/api/detail?id=d7046d818dc111ee860d0fedad361070&noside=true) |

### 响应示例
```json
{
	"data":{
		"birthday":"2019-12-05",
		"department_id":"1",
		"department_name":"部门名称",
		"department_number":"001",
		"email":"wei_001",
		"enable":"1",
		"gender":1,
		"hire_date":"2019-12-05",
		"id":"1",
		"id_number":"458555185412130026",
		"leave_date":"2019-12-05",
		"mobile":"12332112345",
		"name":"名称",
		"number":"ZY001",
		"settle_bank_id":"1001001",
		"settle_type_id":"1001",
		"wechat":"wei_001"
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