# TicketsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**ticketsControllerCancel**](TicketsApi.md#ticketscontrollercancel) | **DELETE** /tickets/{id} | Leave the queue |
| [**ticketsControllerCreate**](TicketsApi.md#ticketscontrollercreate) | **POST** /tickets | Join the queue |
| [**ticketsControllerFindAll**](TicketsApi.md#ticketscontrollerfindall) | **GET** /tickets | List all tickets |
| [**ticketsControllerFindOne**](TicketsApi.md#ticketscontrollerfindone) | **GET** /tickets/{id} | Get ticket status, position and estimated wait |



## ticketsControllerCancel

> TicketResponseDto ticketsControllerCancel(id)

Leave the queue

### Example

```ts
import {
  Configuration,
  TicketsApi,
} from '';
import type { TicketsControllerCancelRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new TicketsApi();

  const body = {
    // string
    id: id_example,
  } satisfies TicketsControllerCancelRequest;

  try {
    const data = await api.ticketsControllerCancel(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

[**TicketResponseDto**](TicketResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** |  |  -  |
| **404** | Ticket not found |  -  |
| **409** | Ticket already called or cancelled |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## ticketsControllerCreate

> TicketResponseDto ticketsControllerCreate(createTicketDto)

Join the queue

### Example

```ts
import {
  Configuration,
  TicketsApi,
} from '';
import type { TicketsControllerCreateRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new TicketsApi();

  const body = {
    // CreateTicketDto
    createTicketDto: ...,
  } satisfies TicketsControllerCreateRequest;

  try {
    const data = await api.ticketsControllerCreate(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **createTicketDto** | [CreateTicketDto](CreateTicketDto.md) |  | |

### Return type

[**TicketResponseDto**](TicketResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** |  |  -  |
| **400** | Reason missing or unknown |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## ticketsControllerFindAll

> Array&lt;TicketResponseDto&gt; ticketsControllerFindAll()

List all tickets

### Example

```ts
import {
  Configuration,
  TicketsApi,
} from '';
import type { TicketsControllerFindAllRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new TicketsApi();

  try {
    const data = await api.ticketsControllerFindAll();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;TicketResponseDto&gt;**](TicketResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## ticketsControllerFindOne

> TicketResponseDto ticketsControllerFindOne(id)

Get ticket status, position and estimated wait

### Example

```ts
import {
  Configuration,
  TicketsApi,
} from '';
import type { TicketsControllerFindOneRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new TicketsApi();

  const body = {
    // string
    id: id_example,
  } satisfies TicketsControllerFindOneRequest;

  try {
    const data = await api.ticketsControllerFindOne(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

[**TicketResponseDto**](TicketResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** |  |  -  |
| **404** | Ticket not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

