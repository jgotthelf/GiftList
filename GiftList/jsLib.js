function getUser(s) {
    $.ajax(
		{
		    type: "POST",
		    async: false,
		    url: "glData.svc/GetUserFromSession",
		    dataType: "json",
		    data: "{\"sess\" : \"" + s + "\" }",
		    contentType: "application/json; charset=utf-8",
		    success:
			function (json) {
			    user = json.d;
			},
		    error:
				function (err) {
				    alert('Error: ' + err.statusText);
				    debugger;
				}
		})
}

function getEventImage(s, f) {
	var qs = new Querystring();
	var fName = qs.get("f");

	$.ajax(
		{
			type: "POST",
			async: false,
			url: "glData.svc/GetEventImages",
			dataType: "json",
			data: "{\"session\" : \"" + s + "\", \"fName\" : \"" + f + "\" }",
			contentType: "application/json; charset=utf-8",
			success:
			function (json) {
				$("#eventImage").html(json.d);
			},
			error:
				function (err) {
					alert('Error: ' + err.statusText);
					debugger;
				}
		})
		}

function getEventTitle(s, f) {
		var qs = new Querystring();
		var fName = qs.get("f");

		$.ajax(
	{
		type: "POST",
		async: false,
		url: "glData.svc/GetEventTitle",
		dataType: "json",
		data: "{\"session\" : \"" + s + "\", \"fName\" : \"" + f + "\" }",
		contentType: "application/json; charset=utf-8",
		success:
		function (json) {
			$("#eventTitle").html(json.d);
		},
		error:
			function (err) {
				alert('Error: ' + err.statusText);
				debugger;
			}
	})
}