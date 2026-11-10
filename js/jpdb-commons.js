/* 
 * JsonPowerDB (JPDB) Common JavaScript Toolkit
 * Developed by Login2Xplore Technologies Pvt. Ltd.
 */

var baseUrl = "http://api.login2explore.com:5577";
var imlPart = "/api/iml";
var irlPart = "/api/irl";

function setBaseUrl(url) {
    baseUrl = url;
}

function createPUTRequest(connToken, jsonObj, dbName, relName) {
    var putRequest = "{\n"
            + "\"token\" : \""
            + connToken
            + "\","
            + "\"dbName\": \""
            + dbName
            + "\",\n"
            + "\"cmd\" : \"PUT\",\n"
            + "\"rel\" : \""
            + relName + "\",\n"
            + "\"jsonStr\": \n"
            + jsonObj
            + "\n"
            + "}";
    return putRequest;
}

function createGET_BY_KEYRequest(token, dbname, relationName, jsonObjStr, createTime, updateTime) {
    if (createTime !== undefined) {
        if (createTime !== true) {
            createTime = false;
        }
    } else {
        createTime = false;
    }
    if (updateTime !== undefined) {
        if (updateTime !== true) {
            updateTime = false;
        }
    } else {
        updateTime = false;
    }
    var getRequest = "{\n"
            + "\"token\" : \""
            + token
            + "\",\n"
            + "\"cmd\" : \"GET_BY_KEY\",\n"
            + "\"dbName\": \""
            + dbname
            + "\",\n"
            + "\"rel\" : \""
            + relationName
            + "\",\n"
            + "\"jsonStr\":\n"
            + jsonObjStr
            + ",\n"
            + "\"createTime\":"
            + createTime
            + ",\n"
            + "\"updateTime\":"
            + updateTime
            + "\n"
            + "}";
    return getRequest;
}

function createUPDATERecordRequest(token, jsonObj, dbName, relName, reqId) {
    var req = "{\n"
            + "\"token\" : \""
            + token
            + "\","
            + "\"dbName\": \""
            + dbName
            + "\",\n"
            + "\"cmd\" : \"UPDATE\",\n"
            + "\"rel\" : \""
            + relName
            + "\",\n"
            + "\"jsonStr\":{ \""
            + reqId
            + "\":\n"
            + jsonObj
            + "\n}"
            + "}";
    return req;
}

function createREMOVE_RECORDRequest(token, dbName, relName, reqId) {
    var req = "{\n"
            + "\"token\" : \""
            + token
            + "\","
            + "\"dbName\": \""
            + dbName
            + "\",\n"
            + "\"cmd\" : \"REMOVE\",\n"
            + "\"rel\" : \""
            + relName
            + "\",\n"
            + "\"record\":"
            + reqId
            + "\n"
            + "}";
    return req;
}

function executeCommandAtGivenBaseUrl(reqString, dbBaseUrl, apiEndPointUrl) {
    var url = dbBaseUrl + apiEndPointUrl;
    var jsonObj;
    $.ajax({
        url: url,
        method: "POST",
        data: reqString,
        async: false,
        timeout: 1000,
        success: function (result) {
            try {
                jsonObj = typeof result === "object" ? result : JSON.parse(result);
            } catch (e) {
                jsonObj = { status: 200, data: result };
            }
        },
        error: function (xhr) {
            try {
                if (xhr && xhr.responseText && xhr.responseText !== "undefined") {
                    jsonObj = JSON.parse(xhr.responseText);
                } else {
                    jsonObj = { status: (xhr && xhr.status) ? xhr.status : 0, message: "Server connection failed or endpoint unreachable" };
                }
            } catch (e) {
                jsonObj = { status: (xhr && xhr.status) ? xhr.status : 0, message: "Server connection failed" };
            }
        }
    });
    return jsonObj;
}
