# Kingdee API Development Guide
### 金蝶云星辰API开发指南

#### 1. 功能简介与限制
在开始开发前，有几个核心要点需要了解：
*   **适用产品**：本指南及所调用的接口适用于**金蝶云星辰标准版、专业版、旗舰版**。
*   **接口与产品功能同步**：请注意，接口的可用性取决于对应产品版本是否拥有该功能模块。例如，若标准版没有【出纳】模块，则所有【出纳接口】的调用都会失败。
*   **调用限制**：为了保障系统稳定，每个账套的接口调用频率限制为 **500次/分钟**。
*   **安全通知**：请务必关注金蝶云星辰API的隐私安全政策，相关通知可通过[此链接](https://open.jdy.com/#/conent/index?id=64)查看。

#### 2. 开发前置条件
在调用API之前，你需要完成以下两个基础步骤：
1.  **创建应用**：首先需要在开放平台创建一个应用，以获取开发者身份。
    *   查看[创建应用详细指引](https://open.jdy.com/#/files/api/detail?index=3&categrayId=316e1f5bd9d711ed8e36c17691e84ff5&id=a540e3dcd9d811ed8e3677dc79b66e86&noside=true)
    *   已创建应用
2.  **申请沙箱环境**：建议先在沙箱环境中进行开发和测试，确保功能稳定后再对接正式环境。
    *   查看[申请沙箱环境详细指引](https://open.jdy.com/#/files/api/detail?index=3&categrayId=5403e0fd6a5811eda819b759130d6d33&id=94258fafd9de11edbfb2c7da3836a943&noside=true)
    *   已申请沙箱环境

#### 3. 获取授权信息
应用创建并授权后，你需要获取以下四个关键信息，它们将在后续的接口调用中用到。你可以从“[获取授权信息](https://open.jdy.com/#/files/api/detail?index=3&categrayId=5403e0fd6a5811eda819b759130d6d33&id=9d5e184dd9de11ed8e3697d4973ff91a&noside=true)”步骤中获得：

| 参数名称 | 说明 |
| :--- | :--- |
| **clientId** | 应用的唯一标识（应用ID），用于获取`app-token`。 |
| **app_key** | 授权key，与`clientId`和`app_secret`配合使用，用于获取`app-token`。 |
| **app_secret** | 授权密钥，用于获取`app-token`，请务必妥善保管。 |
| **domain** | 环境所属的IDC域名。在调用API时，此值将用作请求头中的 `X-GW-Router-Addr`。 |

#### 4. 获取访问令牌 (app-token)
在调用具体的业务接口前，必须先获取访问令牌。你需要使用上一步获取的 `clientId`、`app_key`、`app_secret` 来请求一个临时的 `app-token`。
*   查看[获取 app-token 详细指引](https://open.jdy.com/#/files/api/detail?index=3&categrayId=5403e0fd6a5811eda819b759130d6d33&id=9076d1a6da9d11ed8e36874bed64e0be&noside=true)

#### 5. 调用业务API (以客户列表接口为例)
获取到 `app-token` 后，就可以开始调用具体的业务接口了。以下是调用所有API都需要遵循的通用规则，并以 **“查询客户列表”** 接口为例进行说明。

##### 5.1 必填Header参数
所有API请求的Header中都必须包含以下参数：

| 参数名称 | 参考示例 | 必选 | 说明 |
| :--- | :--- | :--- | :--- |
| **Content-Type** | `application/json` | 是 | 固定值，表明请求体为JSON格式。 |
| **X-Api-ClientID** | `205022` | 是 | 你的应用ID (`clientId`)。 |
| **X-Api-Auth-Version** | `2.0` | 是 | 固定值，表示API认证版本。 |
| **X-Api-TimeStamp** | `1655775240000` | 是 | 当前时间的**毫秒级**时间戳。该请求的有效期为5分钟。 |
| **X-Api-SignHeaders** | `X-Api-TimeStamp,X-Api-Nonce` | 是 | 固定值，指定参与签名的Header。 |
| **X-Api-Nonce** | `1655775240000` | 是 | 一个随机正整数，用于增加签名的唯一性。 |
| **X-Api-Signature** | `xxx` | 是 | 请求签名。用于验证请求的合法性和完整性。[请参考详细的加密规则](https://open.jdy.com/#/files/api/detail?index=3&categrayId=5403e0fd6a5811eda819b759130d6d33&id=b5c26557da9d11ed8e36f9799578d2e1&noside=true)。 |
| **app-token** | `xxx` | 是 | 第4步中获取的、针对特定账套的访问令牌。 |
| **X-GW-Router-Addr** | `https://tf.jdy.com/` | 是 | IDC域名，即第3步获取的 `domain` 字段值。 |

##### 5.2 请求示例 (Curl)
以下是一个使用 `curl` 命令调用客户列表接口的完整示例，你可以参考此格式构建自己的API请求。

```bash
curl --location --request POST 'http://api.kingdee.com/jdy/v2/bd/customer' \
--header 'Content-Type: application/json' \
--header 'X-Api-ClientID: 你的clientId' \
--header 'X-Api-Auth-Version: 2.0' \
--header 'X-Api-TimeStamp: 当前毫秒级时间戳' \
--header 'X-Api-Nonce: 随机正整数' \
--header 'X-Api-SignHeaders: X-Api-TimeStamp,X-Api-Nonce' \
--header 'X-Api-Signature: 计算出的签名值' \
--header 'app-token: 获取到的app-token' \
--header 'X-GW-Router-Addr: 你的domain值' \
--data-raw '{
    "pagesize": "100",
    "page": 1
}'
```

##### 5.3 成功响应示例
如果请求成功，你将收到类似下面的JSON响应。其中 `errcode` 为0表示成功，`data` 字段中包含了分页信息和客户数据列表。

```json
{
    "errcode": 0,
    "data": {
        "current_page_size": 1,
        "total_page": 100,
        "count": "1",
        "page": 1,
        "rows": [
            {
                "number": "001",
                "group_name": "1",
                "enable": "1",
                "name": "客户001",
                "remark": "001",
                "id": "768582155554002944",
                "c_level_id": "1"
            }
        ],
        "current_page": 1,
        "page_size": 100
    },
    "description": "success"
}
```