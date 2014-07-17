function logon() {
	var u = $("#cboUser").val();
	var p = $("#txtPassword").val();

	$.ajax(
		{
			type: "POST",
			async: false,
			url: "glData.svc/Logon",
			dataType: "json",
			data: "{\"userId\" : " + u + ", \"password\" : \"" + p + "\" }",
			contentType: "application/json; charset=utf-8",
			success:
			function (json) {
				if (json.d == "__no__")
					alert("Username & Password are not valid...");
				else {
					window.location = "ShowList.htm?s=" + json.d;
				}
			},
			error:
				function (err) {
					alert('Error: ' + err.statusText);
				}
		})
}

function logonByEmail() {
	var Values = {
		"eMail": $("#txtEmail").val(),
		"password": $("#txtPassword").val()
	}

	$.ajax(
		{
			type: "POST",
			async: false,
			url: "glData.svc/LogonByEmail",
			dataType: "json",
			data: JSON.stringify(Values),
			contentType: "application/json; charset=utf-8",
			success:
			function (json) {
				if (json.d == "__no__")
					alert("Username & Password are not valid...");
				else {
					window.location = "ShowList.htm?s=" + json.d;
				}
			},
			error:
				function (err) {
					alert('Error: ' + err.statusText);
				}
		})
}

$(function () {
	//var qs = new Querystring();
	//var fName = qs.get("f");
	//alert(window.location);
	$("#btnLogon").click(logonByEmail);
	//getEventImage('', fName);
	//getEventTitle('', fName);
	$.ajax(
		{
			type: "POST",
			async: false,
			url: "glData.svc/GetLogonUserList",
			dataType: "json",
			data: "{\"fName\" : \"" + fName + "\" }",
			contentType: "application/json; charset=utf-8",
			success:
			function (json) {
				$.each(json.d.Users, function (index, optionData) {
					$("#cboUser").append("<option value='" + optionData.Key + "'>" + optionData.Value + "</option>");
				});
				$("#cboUser").focus();
			},
			error:
				function (err) {
					debugger;
					alert('Error: ' + err.statusText);
				}
		})
})
