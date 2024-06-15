var dataToUpload = [];

function reformatData(data) {
    for (var key in data) {
        for (var key1 in data[key])
            if (['PunchIn', 'PunchOut', 'Duration'].includes(key1)) {
                let [tmpDate, tmpTime] = (data[key][key1]).split(' ');
                tmpDate = tmpDate.split("/").reverse().join("-");
                data[key][key1] = tmpDate + ' ' + tmpTime;
            }

    }
    dataToUpload = data;

    buildHtmlTable('#confirmation-table', dataToUpload);
}

function buildHtmlTable(selector, myList) {
    var columns = addAllColumnHeaders(myList, selector);

    for (var i = 0; i < myList.length; i++) {
        var row$ = $('<tr/>');
        for (var colIndex = 0; colIndex < columns.length; colIndex++) {
            var cellValue = myList[i][columns[colIndex]];
            if (cellValue == null) cellValue = "";
            row$.append($('<td/>').html(cellValue));
        }
        $(selector).append(row$);
    }
}

function addAllColumnHeaders(myList, selector) {
    var columnSet = [];
    var headerTr$ = $('<tr/>');

    for (var i = 0; i < myList.length; i++) {
        var rowHash = myList[i];
        for (var key in rowHash) {
            if ($.inArray(key, columnSet) == -1) {
                columnSet.push(key);
                headerTr$.append($('<th/>').html(key));
            }
        }
    }
    $(selector).append(headerTr$);

    return columnSet;
}

$(document).on('click', '#upload-btn', function () {
    var settings = {
        "url": "https://cedmisnew.gujarat.gov.in/WebService/UploadTraineesAttendanceData",
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json",
            "Cookie": "cookiesession1=678B778C9BD0CF6781471067E351001A"
        },
        "data": JSON.stringify(dataToUpload),
    };

    $.ajax(settings).done(function (response) {
        console.log(response);
    });
})
document.getElementById('excel-file').addEventListener('change', function () {
    var reader = new FileReader();
    reader.onload = function () {
        var arrayBuffer = this.result,
            array = new Uint8Array(arrayBuffer),
            binaryString = String.fromCharCode.apply(null, array);

        /* Call XLSX */
        var workbook = XLSX.read(binaryString, {
            type: "binary"
        });

        /* DO SOMETHING WITH workbook HERE */
        var first_sheet_name = workbook.SheetNames[0];
        /* Get worksheet */
        var worksheet = workbook.Sheets[first_sheet_name];
        var sheetData = XLSX.utils.sheet_to_json(worksheet, {
            raw: true
        });
        reformatData(sheetData);

        $('#upload-btn').show();

    }
    reader.readAsArrayBuffer(this.files[0]);
});

