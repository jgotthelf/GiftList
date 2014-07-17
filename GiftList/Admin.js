var user = null;
var detailCol = 3;
var gotItCol = 5;
var li_Key = 0;
var li_rp_key = 0;
var takenByRow = 6;
var hideFromRow = 7;
var sortEnabled = false;
var gData = null;

$(function () {
	var qs = new Querystring();
	var s = qs.get("s");

	if (user == null)
		getUser(s);

	if (user == null) {
		alert("Unable to load page - user = null");
		return;
	}

	if (user.RecordState != "Ok") {
		alert("Unable to load page - RecordState = " + user.RecordState);
		return;
	}

	getEventImage(s, '');
	getEventTitle(s, '');
	bindAdminGrid();
	$("#newUser").click(function () {
		newUser();
	});

	tips = $(".validateTips");
	function updateTips(t) {
		//tips.text(tips.text() + "<br>" + t).addClass("ui-state-highlight");
		tips.text(t).addClass("ui-state-highlight");
		setTimeout(function () {
			tips.removeClass("ui-state-highlight", 1500);
		}, 500);
	}

	function checkLength(o, n, min, max) {
		if (o.val().length > max || o.val().length < min) {
			o.addClass("ui-state-error");
			updateTips("Length of " + n + " must be between " +
					min + " and " + max + ".");
			return false;
		} else {
			return true;
		}
	}

	function checkRegexp(o, regexp, n) {
		if (!(regexp.test(o.val()))) {
			o.addClass("ui-state-error");
			updateTips(n);
			return false;
		} else {
			return true;
		}
	}

	$("#dialog-form").dialog({
		autoOpen: false,
		height: 500,
		width: 350,
		modal: true,
		buttons: {
			"Save": function () {
				var isOK = true;

				fName = $("#FirstName");
				lName = $("#LastName");
				password = $("#Password");
				email = $("#email");

				isOK = isOK && checkLength(lName, "Last Name", 1, 30);
				isOK = isOK && checkLength(fName, "First Name", 1, 30);
				isOK = isOK && checkLength(password, "Password", 1, 20);
				isOK = isOK && checkLength(email, "email", 6, 48);
				isOK = isOK && checkRegexp(email, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, "eMail format is incorrect");

				var uData = {
					Key: $("#rp_key").val(),
					LastName: lName.val(),
					FirstName: fName.val(),
					rp_password: password.val(),
					Email: email.val(),
					rp_fm_key: user.Family.Key,
					rp_recipient: 1,
					rp_giver: 1
				}

				var values = {
					user: uData
				};

				var settings = {
					values: values,
					url: 'glData.svc/SaveUser',
					async: true,
					error: function (err) {
						alert(err.responseText);
					},
					success: function (jsonData, st) {
						if (st == "success") {
							$("#adminGrid").clearGridData().setGridParam({ page: gData.page });
							getDetailData(gData);
						} else {
							alert(st);
						}
					}
				};
				runAjax(settings);

				if (isOK) {
					$(this).dialog("close");
				}
			},
			Delete: function () {
				if (confirm("Are you sure?  If this user has any items on their list, they will be irretrievably lost.")) {
					if (confirm("Last chance - are you sure you want to remove this user and all of their associated data?")) {
						var values = {
							rp_Key: $("#rp_key").val()
						};

						var settings = {
							values: values,
							url: 'glData.svc/Deleteuser',
							async: true,
							error: function (err) {
								alert(err.responseText);
							},
							success: function(jsonData, st)  {
								$("#adminGrid").clearGridData().setGridParam({ page: gData.page });
								getDetailData(gData);
								alert("The user & all associated data has been deleted.");
								$("#dialog-form").dialog("close");
							}
						};
						runAjax(settings);
					}
				}
			},
			Cancel: function () {
				$(this).dialog("close");
			}
		},
		close: function () {
			allFields = $([]).add($("#FirstName")).add($("#LastName")).add($("#Password")).add($("#email"));
			allFields.val("").removeClass("ui-state-error");
		}
	})
});


function bindAdminGrid() {
	$("#adminGrid").jqGrid({
		datatype: function (pData) {
			gData = pData;
			$("#adminGrid").clearGridData().setGridParam({ page: pData.page });
			getDetailData(pData);
		},
		colNames: ['ID', 'Last Name', 'First Name'],
		colModel: [{ name: 'Key', index: 'Key', width: 100, align: 'left', key: true },
					{ name: 'LastName', index: 'LastName', width: 300, align: 'left' },
					{ name: 'FirstName', index: 'FirstName', width: 300, align: 'left' }
					   ],
		rowNum: 10,
		rowList: [10, 20, 50, 100],
		sortname: 'ItemTitle',
		pager: $('#pageNavigation'),
		multiselect: false,
		sortorder: "asc",
		viewrecords: true,
		height: 'auto',
		width: 'auto',
		loadui: "block",
		loadtext: "",
		onSelectRow: function (rowID) {
			if (rowID) {
				$("#id").text(rowID);
				var search = {
					"rp_Key": rowID
				};

				var settings = {
					values: search,
					url: 'glData.svc/GetRecipient',
					error: function (err) {
						alert(err.responseText);
					},
					success: function (jsonData, st) {
						if (st == "success") {
							$("#FirstName").val(jsonData.d.FirstName);
							$("#LastName").val(jsonData.d.LastName);
							$("#Password").val(jsonData.d.rp_password);
							$("#email").val(jsonData.d.Email);
							$("#rp_key").val(jsonData.d.Key);
							$("#dialog-form").dialog("open");
						}
					}
				};

				runAjax(settings);
			}

			return true;
		}
	});
}

function newUser() {
	$("#id").text("");
	$("#FirstName").val("");
	$("#LastName").val("");
	$("#Password").val("");
	$("#email").val("");
	$("#rp_key").val(-1);

	$("#dialog-form").dialog("open");
}

function getDetailData(pData) {
	gData = pData;
	var orderBy = pData.sidx + " " + pData.sord;

    var search = {
      	"fKey": user.Family.Key,
      	"pageIndex": pData.page - 1,
      	"pageSize": pData.rows,
		"orderBy": orderBy
    };

    var settings = {
    	values: search,
    	url: 'glData.svc/GetUserList',
    	error: function (err) {
    		alert(err.responseText);
    	},
    	success: function (jsonData, st) {
    		if (st == "success") {
    			var theGrid = $("#adminGrid")[0];
    			var encodedJson = formatAdminGrid(jsonData.d, pData.page, pData.rows);

    			//if (convertJson == null) {
//    				app.showErrorModal('JSON Conversion Error, Trace : successFunction()');
  //  				return false;
    //			}
    			//convertJson = '{"page":1, "total":3,"records":30,"rows":[{"cell":[749,"Bonta","Jason"]},{"cell":[748,"CLAUS","SANTA"]},{"cell":[16,"Dotzert","Daniel"]},{"cell":[137,"Flinstone","Fred"]},{"cell":[200,"G","Sophie"]},{"cell":[7,"G","Barb"]},{"cell":[2,"G","Joe"]},{"cell":[3,"G","Kathy"]},{"cell":[4,"G","Mom"]},{"cell":[109,"G","Sasha"]}]}';
    			//alert(convertJson);
    			//var encoded = $.evalJSON(convertJson);
    			//alert(convertJson);

    			theGrid.addJSONData(encodedJson);

    			//aliasId = $("#adminGrid" + ' tbody:first-child tr:first').attr('id');
    			//$("#adminGrid").setSelection("#adminGrid");

    		}
    	}
    };

    runAjax(settings);

	$("#loading").hide();
}

function formatAdminGrid(jData, pageIndex, pageSize) {
	var pageCount = parseInt(jData.TotalRecords / pageSize);

	if ((pageCount * pageSize) < jData.TotalRecords)
		pageCount++;

	var rows = [];
	$(jData.Users).each(function (index, obj) {
		var row = {
			"id": obj.ListKey,
			"cell": [
					obj.Key,
					obj.LastName,
					obj.FirstName
				]
		};
		rows = rows.concat(row);
	});

	var data = {
		"page": pageIndex, // Current page #
		"total": pageCount, // # of Pages
		"records": jData.TotalRecords, // Total # of Records
		"rows": rows // The actual data rows
	};

	return data;
}

function runAjax(settings) {
    var async = false;

    $.ajax({
      	url: settings.url,
      	async: async,
      	data: JSON.stringify(settings.values),
      	processData: false,
      	dataType: "json",
      	type: "POST",
      	contentType: "application/json; charset=utf-8",
      	success: settings.success,
      	error: function (err) {
      		app.checkSession(err);
      		app.showErrorModal(err.responseText);
      	}
    });
}