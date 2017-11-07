var user = null;
var detailCol = 5;
var gotItCol = 7;
var li_Key = 0;
var li_rp_key = 0;
var takenByRow = 7;
var hideFromRow = 8;
var giverCommentRow = 9;
var sortEnabled = false;

$(function () {
	var qs = new Querystring();
	var s = qs.get("s");
	getEventImage(s, '');
	getEventTitle(s, '');

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

	getRecipientList();

	getList();

	$("#btnAdd").click(function () {
		newItem();
	});

	$("#cboRecipList").change(function () {
		getList();
		$('.ListItemRow').click(RowClick);
	});

	$("#chkShowDetails").click(function () {
		if ($(this).attr("checked")) {
			$("table td:nth-child(" + detailCol + ")").show('slow')
			$("table th:nth-child(" + detailCol + ")").show('slow')
		} else {
			$("table td:nth-child(" + detailCol + ")").hide('fast')
			$("table th:nth-child(" + detailCol + ")").hide('fast')
		}
	});

	$("#chkExcludeGotIt").click(function () {
		if ($(this).attr("checked")) {
			$("table td:nth-child(" + gotItCol + "):contains('Yes')").parent().hide('fast')
		} else {
			$("table td:nth-child(" + gotItCol + "):contains('Yes')").parent().show('fast')
		}
	});


	$("#cmdSave").click(function () {
		if (SaveDetail())
			$$('modalWindow').style.display = $$('modalBackground').style.display = 'none';

	});

	$("#cmdSaveAdd").click(function () {
		if (SaveDetail()) {
			newItem();
		}
	});

	$("#cmdCancel").click(function () {
		$$('modalWindow').style.display = $$('modalBackground').style.display = 'none';
	});

	$("#cmdDelete").click(function () {
		if (confirm("Are you sure you want to delete this record?")) {
			DeleteRow();
			$$('modalWindow').style.display = $$('modalBackground').style.display = 'none';
		}
	});

	$('.ListItemRow').click(RowClick);
	setSorting();

	$("#frmItem").validate({
		rules: {
			txtTitle: {
				required: true
			}
		}
	});
})

function DeleteRow() {
    var Values = {
        "li_Key": li_Key
    };

    $.ajax(
		{
		    type: "POST",
		    async: false,
		    url: "glData.svc/DeleteItem",
		    dataType: "json",
		    data: JSON.stringify(Values),
		    contentType: "application/json; charset=utf-8",
		    success:
			function (json) {
			    getList();
			    $('.ListItemRow').click(RowClick);
			},
		    error:
				function (err) {
				    alert('Error: ' + err.responseText);
				}
		});
}

function setSorting() {
    if (!sortEnabled) {
        try {
            $("#glist").tablesorter({
                // sort on the first column and third column, order asc
                // debug: true,
                sortList: [[0, 0], [1, 0]]
            });
            sortEnabled = true;
        }
        catch (e) {
            // do nothing
        }
    }
}

function SaveDetail() {
    var msg = '';
    if ($.trim($("#txtTitle").val()).length == 0)
        msg += 'Title';

//    if ($.trim($("#txtDescription").val()).length == 0)
//        msg += 'Description';

    if (msg.length != 0) {
        alert('The following are required:\n' + msg);
        return false;
    }

    //if (li_rp_key < 0)
    li_rp_key = $("#cboGiftFor").val();
    var Values = {
        "user_Id": user.Key,
        "li_Key": li_Key,
        "RecpientKey": li_rp_key,
        "ItemTitle": $("#txtTitle").val(),
        "Details": $("#txtDescription").val(),
        "TakenBy": 0,
        "EnteredBy": 0,
        "GotIt": 0,
        "Url": $("#txtURL").val(),
        "li_TakenBy": parseInt($("#cboTakenBy").val()),
        "li_rp_Key": li_rp_key,
        "li_HideFrom": parseInt($("#cboHideFrom").val()),
        "li_GotIt": $("#chkAquired").attr('checked'),
        "Color": $("#txtColor").val(),
        "Size": $("#txtSize").val(),
		"GiverComment": $("#txtGiverComment").val()
    };
    $.ajax(
		{
		    type: "POST",
		    async: false,
		    url: "glData.svc/SaveItem",
		    dataType: "json",
		    data: JSON.stringify(Values),
		    contentType: "application/json; charset=utf-8",
		    success:
			function (json) {
			    getList();
			    $('.ListItemRow').click(RowClick);
			},
		    error:
				function (err) {
				    alert('Error: ' + err.responseText);
				}
		});
    return true;

}

function RowClick() {
    // Fill properties
    li_Key = $(this)[0].name.substring(1).split(':')[0];
    FillDetail(li_Key);
    showDialog("edit");
    $("#txtGiftFor").val($("#cboRecipList option:selected").text());
    return false;
}

function newItem() {
    var rpid = $("#cboRecipList").val();
    li_rp_key = -1;
    ClearDetail(rpid);
    showDialog("new");
}

function showDialog(mode) {
    $$('modalWindow').style.display = $$('modalBackground').style.display = 'inline';

    if (true) {
        // call once to center everything
        OnWindowResize();

        if (window.attachEvent)
            window.attachEvent('onresize', OnWindowResize);
        else if (window.addEventListener)
            window.addEventListener('resize', OnWindowResize, false);
        else
            window.onresize = OnWindowResize;

        if (document.all)
            document.documentElement.onscroll = OnWindowResize;
    }

    if (mode == "new") {
        $("#cmdDelete").hide();
        $("#txtGiftFor").hide();
        $("#cboGiftFor").show();
        if ($("#cboRecipList option:selected").val() > 0)
            $("#cboGiftFor").val($("#cboRecipList option:selected").text());
        else
            $("#cboGiftFor").val(0);
    } else {
        if ($("#txtAuthor").val() == user.Key)
            $("#cmdDelete").show();
        else
            $("#cmdDelete").hide();
        $("#txtGiftFor").show();
        $("#cboGiftFor").hide();
    }
}

function ClearDetail(userKey) {
    li_Key = 0;
    li_rp_key = userKey; // todo: Get li_rp_key on add
    $("#txtTitle").val('');
    $("#txtDescription").val('');
    $("#txtURL").val('');
    $("#cboTakenBy").val(0);
    $("#cboHideFrom").val(0);
    $("#chkAquired").attr('checked', false);
    $("#txtColor").val('');
    $("#txtSize").val('');
    $("#txtGiverComment").val('');

    if (userKey == user.Key) {
    	$("table tr:nth-child(" + takenByRow + ")").hide();
    	$("table tr:nth-child(" + hideFromRow + ")").hide();
        $("table tr:nth-child(" + giverCommentRow + ")").hide();
    } else {
    $("table tr:nth-child(" + takenByRow + ")").show();
        $("table tr:nth-child(" + hideFromRow + ")").show();
        $("table tr:nth-child(" + giverCommentRow + ")").show();
    }
}

function FillDetail(li_Key) {
    var Values = {
        "li_Key": li_Key
    };

    $.ajax(
		{
		    type: "POST",
		    async: false,
		    url: "glData.svc/GetItem",
		    dataType: "json",
		    data: JSON.stringify(Values),
		    contentType: "application/json; charset=utf-8",
		    success:
			function (json) {
			    li_Key = json.d.ListKey;
			    li_rp_key = json.d.RecipientKey;
			    $("#cboGiftFor").val(li_rp_key);
			    $("#txtTitle").val(json.d.ItemTitle);
			    $("#txtDescription").val(json.d.Details);
			    $("#txtURL").val(json.d.Url);
			    $("#cboTakenBy").val(GetZeroForNull(json.d.li_TakenBy));
			    $("#cboHideFrom").val(GetZeroForNull(json.d.li_HideFrom));
			    if (json.d.li_GotIt == 1)
			        $("#chkAquired").attr('checked', true);
			    else
			        $("#chkAquired").attr('checked', false);
			    $("#txtColor").val(json.d.Color);
			    $("#txtSize").val(json.d.Size);
			    $("#txtAuthor").val(json.d.Author);
			    $("#txtGiverComment").val(json.d.GiverComment);

			    if (json.d.RecipientKey == user.Key) {
			        $("table tr:nth-child(" + takenByRow + ")").hide()
			        $("table tr:nth-child(" + hideFromRow + ")").hide()
			        $("table tr:nth-child(" + giverCommentRow + ")").hide();
			    } else {
			        $("table tr:nth-child(" + takenByRow + ")").show()
			        $("table tr:nth-child(" + hideFromRow + ")").show()
			        $("table tr:nth-child(" + giverCommentRow + ")").show();
			    }
			},
		    error:
				function (err) {
				    alert('Error: ' + err.responseText);
				}
		})
}

function GetZeroForNull(value) {
    if (value == null)
        return 0;
    else
        return value;
}

function getList() {
    $("#loading").show();
    $.ajax(
		{
			type: "POST",
			async: false,
			url: "glData.svc/GetList",
			dataType: "json",
			data: "{\"User_Key\" : " + user.Key + ", \"rp_fm_key\" : " + user.Family.Key + ", \"recipient\" : " + $("#cboRecipList").val() + " }",
			contentType: "application/json; charset=utf-8",
			success:
			function (json) {
				//$(".ListRow").remove();
				var tBody = $("#glist tbody");
				tBody.empty();

				$.each(json.d, function (index, optionData) {
					var row = "<tr class='ListRow'>";
					row = row + "<td>" + optionData.Recipient + "</td>";
					row = row + "<td><a href='#' class='ListItemRow' name=k" + optionData.ListKey + ":" + optionData.RecipientKey + ">" + optionData.ItemTitle + "</a></td>";
					row = row + "<td>" + optionData.Size + "</td>";
					row = row + "<td>" + optionData.Color + "</td>";
					row = row + "<td>" + optionData.Details;
					if (optionData.Url != "")
						row = row + "<br><a target=\"_blank\" href='" + optionData.Url + "'>Click for Website (Will open in a new browser)</a>";
					row = row + "</td>";
					row = row + "<td class='" + (optionData.TakenBy == "****************" ? "TableHiddenData" : "TableRightData") + "'>" + optionData.TakenBy + "</td>"
					row = row + "<td class='" + (optionData.GotIt == '****' ? "TableHiddenData" : "TableRightData") + "'>" + optionData.GotIt + "</td>"
					row = row + "<td class='" + (optionData.TakenBy == '****' ? "TableHiddenData" : "TableRightData") + "'>" + optionData.EnteredBy + "</td>"

					if (optionData.CreateDate == "1/1/1980")
						row = row + "<td class='TableRightData'>??</td>"
					else
						row = row + "<td class='TableRightData'>" + optionData.CreateDate + "</td>"
					row = row + "</tr>";

					tBody.append(row);
					//$("#glist tr:last").after(row);
				});
				$("#glist").trigger("update");
				//$("#glist").trigger("debug", "true");
				//$("#glist").trigger("sorton", "[[1, 0]]");
				/*
				$("#TheList").setTemplate($('#TemplateResultsTable').html())
				$("#TheList").processTemplate(json);
				if (!($("#chkShowDetails").attr("checked")))
				$("table td:nth-child(" + detailCol + ")").hide()

				if ($("#chkExcludeGotIt").attr("checked"))
				$("table td:nth-child(" + gotItCol + "):contains('Yes')").parent().hide()
				*/
			},
			error:
				function (err) {
					alert('Error: ' + err.statusText);
				}
		})
    setSorting();
    $("#loading").hide();
}

function getRecipientList() {
    $.ajax(
		{
		    type: "POST",
		    async: false,
		    url: "glData.svc/GetRecipientList",
		    dataType: "json",
		    data: "{\"fKey\" : \"" + user.Family.Key + "\" }",
		    contentType: "application/json; charset=utf-8",
		    success:
			function (json) {
			    $.each(json.d.Users, function (index, optionData) {
			        if (optionData.Key == user.Key)
			            $("#cboRecipList").append("<option selected value='" + optionData.Key + "'>" + optionData.Value + "</option>");
			        else
			            $("#cboRecipList").append("<option value='" + optionData.Key + "'>" + optionData.Value + "</option>");

			        $("#cboHideFrom").append("<option value='" + optionData.Key + "'>" + optionData.Value + "</option>");
			        $("#cboTakenBy").append("<option value='" + optionData.Key + "'>" + optionData.Value + "</option>");
			        $("#cboGiftFor").append("<option value='" + optionData.Key + "'>" + optionData.Value + "</option>");
			    });
			    $("#cboRecipList").focus();
			},
		    error:
				function (err) {
				    alert('Error: ' + err.statusText);
				}
		})
		if (user.Family.Admin_Key == user.Key) {
		    $("#btnAdmin").show();
		    $("#btnAdmin").click(function () {
		        var qs = new Querystring();
		        window.location = "Admin.htm?s=" + qs.get("s");
		    });
		} else {
		    $("#btnAdmin").hide();
		}
}


function OnWindowResize() {
    var left = window.XMLHttpRequest == null ? document.documentElement.scrollLeft : 0;
    var div = $$('modalWindow');

    div.style.left = Math.max((left + (GetWindowWidth() - div.offsetWidth) / 2), 0) + 'px';
    div.style.top = $(window).scrollTop() + 60 + "px";
}


function OnModalWindowClick() {
    $$('modalWindow').style.display = $$('modalBackground').style.display = 'none';

    // special IE-only processing for windowed elements, like select	
    if (document.all) {
        var type = $$('hideType').value;

        if (type == 'iframe')
            $$('modalIframe').style.display = 'none';
        if (type == 'replace')
            RemoveSelectSpans();
    }

    if (window.detachEvent)
        window.detachEvent('onresize', OnWindowResize);
    else if (window.removeEventListener)
        window.removeEventListener('resize', OnWindowResize, false);
    else
        window.onresize = null;
}

/* These functions deal with IE's retardedness in not allowing divs to 
* cover select elements by replacing the select elements with spans. */

function RemoveSelectSpans() {
    var selects = document.getElementsByTagName('select');

    for (var i = 0; i < selects.length; i++) {
        var select = selects[i];

        if (select.clientWidth == 0 || select.clientHeight == 0 ||
			select.nextSibling == null || select.nextSibling.className != 'selectReplacement') {
            continue;
        }

        select.parentNode.removeChild(select.nextSibling);
        select.style.display = select.cachedDisplay;
    }
}

function ReplaceSelectsWithSpans() {
    var selects = document.getElementsByTagName('select');

    for (var i = 0; i < selects.length; i++) {
        var select = selects[i];

        if (select.clientWidth == 0 || select.clientHeight == 0 ||
			select.nextSibling == null || select.nextSibling.className == 'selectReplacement') {
            continue;
        }

        var span = document.createElement('span');

        // this would be "- 3", but for that appears to shift the block that contains the span 
        //   one pixel down; instead we tolerate the span being 1px shorter than the select
        span.style.height = (select.clientHeight - 4) + 'px';
        span.style.width = (select.clientWidth - 6) + 'px';
        span.style.display = 'inline-block';
        span.style.border = '1px solid rgb(200, 210, 230)';
        span.style.padding = '1px 0 0 4px';
        span.style.fontFamily = 'Arial';
        span.style.fontSize = 'smaller';
        span.style.position = 'relative';
        span.style.top = '1px';
        span.className = 'selectReplacement';

        span.innerHTML = select.options[select.selectedIndex].innerHTML +
			'<img src="custom_drop.gif" alt="drop down" style="position: absolute; right: 1px; top: 1px;" />';

        select.cachedDisplay = select.style.display;
        select.style.display = 'none';
        select.parentNode.insertBefore(span, select.nextSibling);
    }
}

/* The following two functions are not used, but have been kept here because 
*   they might be useful; one must use this method to programmatically add
*   javascript-valued CSS values (using element.style.div = expresssion(...)
*   does not work).  These are only useful for IE.
*/

function AddStyleRules() {
    if (_rulesAdded)
        return;

    _rulesAdded = true;

    var stylesheet = document.styleSheets[document.styleSheets.length - 1];

    if (!document.all) {
        InsertCssRule(stylesheet, '#modalBackground', 'position: fixed; height: 100%; width: 100%; left: 0; top: 0;');
        InsertCssRule(stylesheet, '#modalWindow', 'position: fixed; left: 0; top: 0;');
    }
    else {
        InsertCssRule(stylesheet, '#modalBackground',
			'position: absolute; ' +
			'left: expression(ignoreMe = document.documentElement.scrollLeft + "px"); ' +
			'top: expression(ignoreMe = document.documentElement.scrollTop + "px");' +
			'width: expression(document.documentElement.clientWidth + "px"); ' +
			'height: expression(document.documentElement.clientHeight + "px");');

        InsertCssRule(stylesheet, '#modalWindow',
			'position: absolute; ' +
			'left: expression(ignoreMe = document.documentElement.scrollLeft + "px"); ' +
			'top: expression(ignoreMe = document.documentElement.scrollTop + "px");');

    }
}

function InsertCssRule(stylesheet, selector, rule) {
    if (stylesheet.addRule) {
        stylesheet.addRule(selector, rule, stylesheet.rules.length);
        return stylesheet.rules.length - 1;
    }
    else {
        stylesheet.insertRule(selector + ' {' + rule + '}', stylesheet.cssRules.length);
        return stylesheet.cssRules.length - 1;
    }
}


/* utiltiy functions */

function GetWindowWidth() {
    var width =
		document.documentElement && document.documentElement.clientWidth ||
		document.body && document.body.clientWidth ||
		document.body && document.body.parentNode && document.body.parentNode.clientWidth ||
		0;

    return width;
}

function GetWindowHeight() {
    var height =
		document.documentElement && document.documentElement.clientHeight ||
		document.body && document.body.clientHeight ||
  		document.body && document.body.parentNode && document.body.parentNode.clientHeight ||
  		0;

    return height;
}

function $$(id) {
    return document.getElementById(id);
}
