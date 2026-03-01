# Kingdee API Product Details

### **金蝶API商品详情接口文档**

# 商品详情

**更新于**：2025-12-25 21:32

## 基本信息
- **用途说明**：获取商品详情
- **请求方式**：GET
- **请求地址**：`https://api.kingdee.com/jdy/v2/bd/material_detail`

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
| id | string | false | 商品ID，与`number`二选一 |
| number | string | false | 商品编码，与`id`二选一 |

### 请求示例
```bash
curl --location --request GET 'https://api.kingdee.com/jdy/v2/bd/material_detail?id=1&number=001' \
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
| id | string | 商品ID |
| alarm_day | string | 预警天数 |
| attachments_url | List\<Attachments\> | 附件地址列表 |
| aux_entity | List\<Auxentity\> | 辅助属性列表 |
| aux_unit_id | string | 报表辅助单位ID |
| aux_unit_name | string | 辅助单位名称 |
| aux_unit_number | string | 报表辅助单位编码 |
| barcode | string | 条形码 |
| barcode_entity | List\<BarcodeEntityDetails\> | 商品条码列表 |
| base_unit_id | string | 基本计量单位ID |
| base_unit_name | string | 基本单位名称 |
| bom_entity | List\<BomEntity\> | 套装信息对象列表 |
| brand_id | string | 品牌ID |
| check_type | string | 商品类型（1：普通、2：套装、3：服务） |
| coefficient1 | number | 换算率1 |
| coefficient2 | number | 换算率2 |
| coefficient3 | number | 换算率3 |
| conversion_unit_id1 | string | 换算单位1 |
| conversion_unit_id2 | string | 换算单位2 |
| conversion_unit_id3 | string | 换算单位3 |
| cost_method | string | 成本计算方法（1：移动平均法，2：加权平均法，3：先进先出法） |
| custom_field | Map\<string\> | 自定义字段，[使用指南](https://open.jdy.com/#/files/api/detail?id=76567ff2a06311edaa4b3d71bf0fce53&noside=true) |
| enable | string | 状态（1：启用，0：禁用） |
| fetch_category_id | string | 税收分类编码 |
| fix_unit_id1 | string | 辅助单位1（启用多单位时传递） |
| fix_unit_id2 | string | 辅助单位2 |
| fix_unit_id3 | string | 辅助单位3 |
| gross_weight | string | 毛重 |
| help_code | string | 助记码 |
| high | string | 高 |
| images | List\<Image\> | 商品图片列表 |
| in_tax_rate | string | 进项税率 |
| inv_mgr_type | string | 库存管理方式（0：统一库存，1：分仓库存，默认统一库存） |
| is_assembly | boolean | 是否可为组件 |
| is_asst_attr | boolean | 是否启用辅助属性（默认false） |
| is_batch | boolean | 是否启用批次管理 |
| is_kf_period | boolean | 是否启用保质期管理 |
| is_multi_unit | boolean | 是否启用多单位（默认false） |
| is_purchase | boolean | 是否可采购 |
| is_sale | boolean | 是否可销售 |
| is_serial | boolean | 是否启用序列号管理 |
| is_subpart | boolean | 是否可为子件 |
| is_weight | boolean | 是否启用称重 |
| kf_period | string | 保质期天数/月数/年数 |
| kf_period_type | string | 保质期单位（1：天，2：月，3：年） |
| length | string | 长 |
| max_inventory_qty | string | 最高库存 |
| min_inventory_qty | string | 最低库存 |
| min_package_qty | number | 最小包装量（基本单位） |
| model | string | 规格型号 |
| mul_label | List\<Mullabel\> | 商品标签列表 |
| name | string | 商品名称 |
| net_weight | string | 净重 |
| number | string | 商品编码（不传递则由后台生成） |
| parent_id | string | 商品类别ID |
| parent_number | string | 商品类别编码（与`parent_id`二选一） |
| price_entity | List\<PriceEntityDetails\> | 商品价格列表 |
| pro_license | string | 生产许可证 |
| producing_pace | string | 产地 |
| product_department_id | string | 默认生产车间ID |
| product_department_number | string | 默认生产车间编码 |
| purchase_id | string | 采购员ID |
| purchase_unit_id | string | 采购单位ID |
| qty_inv | string | 可用库存 |
| refistration_number | string | 注册证号 |

---