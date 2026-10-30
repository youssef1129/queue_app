# ReasonsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**reasonsControllerFindAll**](ReasonsApi.md#reasonscontrollerfindall) | **GET** /reasons | List consultation reasons |



## reasonsControllerFindAll

> Array&lt;ReasonDto&gt; reasonsControllerFindAll()

List consultation reasons

### Example

```ts
import {
  Configuration,
  ReasonsApi,
} from '';
import type { ReasonsControllerFindAllRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ReasonsApi();

  try {
    const data = await api.reasonsControllerFindAll();
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

[**Array&lt;ReasonDto&gt;**](ReasonDto.md)

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

