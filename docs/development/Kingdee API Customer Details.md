# Kingdee API Customer Details

### **金蝶API客户详情接口文档**

# 客户详情

**更新于**：2026-02-02 10:24

## 基本信息
- **用途说明**：获取客户详情
- **请求方式**：GET
- **请求地址**：`https://api.kingdee.com/jdy/v2/bd/customer_detail`

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
| 参数名称 | 类型 | 是否必填 | 描述 | 示例值 |
| :--- | :--- | :--- | :--- | :--- |
| id | string | true | 客户ID，与`number`二选一 | `1` |
| number | string | false | 客户编码，与`id`二选一 | `001` |
| show_business_time | string | false | 是否查询客户最近交易时间（true：查询，false：不查询），默认为false | `1` |
| show_debt | string | false | 是否查询客户欠款（true：查询，false：不查询），默认为false | `false` |
| show_period | string | false | 是否查询周期信息（true：查询，false：不查询），默认为false | `false` |
| show_un_visit_days | string | false | 是否显示未拜访天数（true：显示，false：不显示），默认为false | `false` |

### 请求示例
```bash
curl --location --request GET 'https://api.kingdee.com/jdy/v2/bd/customer_detail?id=1&number=001&show_business_time=1&show_debt=false&show_period=false&show_un_visit_days=false' \
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
| settle_customer_id | string | 结算客户ID |
| account_open_addr | string | 开户地址 |
| addr | string | 详细地址，[敏感数据解密](https://open.jdy.com/#/files/api/detail?id=d7046d818dc111ee860d0fedad361070&noside=true) |
| bank | string | 开户银行 |
| bank_account | string | 银行账号，[敏感数据解密](https://open.jdy.com/#/files/api/detail?id=d7046d818dc111ee860d0fedad361070&noside=true) |
| bomentity | List\<[Bomentity](#bomentity)\> | 联系人对象列表 |
| c_level_id | string | 价格等级ID |
| c_level_name | string | 价格等级名称 |
| c_level_number | string | 价格等级编码 |
| city_id | string | 市ID |
| city_name | string | 市名称 |
| city_number | string | 市编码 |
| country_id | string | 国家ID |
| country_name | string | 国家名称 |
| country_number | string | 国家编码 |
| create_time | string | 创建时间 |
| creater_field_name | string | 创建人字段 |
| credit_limit | number | 信用额度 |
| custom_field | Map\<string\> | 自定义字段，[使用指南](https://open.jdy.com/#/files/api/detail?id=76567ff2a06311edaa4b3d71bf0fce53&noside=true) |
| deduct | boolean | 是否自动抵扣预收款 |
| district_id | string | 区ID |
| district_name | string | 区名称 |
| district_number | string | 区编码 |
| enable | string | 状态（1：可用，0：不可用） |
| group_id | string | 类别ID |
| group_name | string | 类别名称 |
| group_number | string | 类别编码 |
| id | string | 客户ID |
| invoice_email | string | 收票邮箱 |
| invoice_name | string | 开票名称 |
| invoice_phone | string | 收票手机号，[敏感数据解密](https://open.jdy.com/#/files/api/detail?id=d7046d818dc111ee860d0fedad361070&noside=true) |
| invoice_type | string | 发票类型（1：纸质专票，2：纸质普票，3：电子普票，4：电子专票，5：全电普票，6：全电专票，0：无需开票） |
| modify_time | string | 修改时间 |
| name | string | 客户名称 |
| number | string | 客户编码 |
| province_id | string | 省ID |
| province_name | string | 省名称 |
| province_number | string | 省编码 |
| rate | string | 增值税税率% |
| remark | string | 备注 |
| sale_dept_id | string | 部门ID |
| sale_dept_name | string | 部门名称 |
| sale_dept_number | string | 部门编码 |
| saler_id | string | 业务员ID |
| saler_name | string | 业务员名称 |
| saler_number | string | 业务员编码 |
| setting_term_id | string | 结算期限ID |
| setting_term_name | string | 结算期限名称 |
| setting_term_number | string | 结算期限编码 |
| settle_customer_name | string | 结算客户名称 |
| settle_customer_number | string | 结算客户编码 |
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

---