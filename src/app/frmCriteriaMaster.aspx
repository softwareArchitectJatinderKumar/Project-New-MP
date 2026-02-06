<%@ Page Title="Outcome Based Planner - Master" Language="C#" MasterPageFile="~/Main.master" AutoEventWireup="true" CodeFile="frmCriteriaMaster.aspx.cs" Inherits="frmCriteriaMaster" %>

<%@ Register Assembly="Telerik.Web.UI" Namespace="Telerik.Web.UI" TagPrefix="telerik" %>

<%@ Register Assembly="AjaxControlToolkit" Namespace="AjaxControlToolkit" TagPrefix="cc1" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="Server">
    <link href="css/bootstrap4.min.css" rel="stylesheet" />
    <script src="Repository/bootstrap/js/bootstrap-4.js"></script>
    <style type="text/css">
        .highlight {
                  background-color: yellow;
                }
        .navi-logo2, .navi-logo 
        {
            height: 23px;
            width: auto;
        }

        .weblink a 
        {
            display: inline !important;
            padding: 0;
        }

        .prog-list li a 
        {
            cursor: pointer;
        }

        .blockUI 
        {
            z-index: 10099 !important;
        }

        #programmepanel .label-heading 
        {
            color: #888;
            font-family: "latoregular";
            font-size: 16px;
            font-weight: normal;
            padding: 0;
            text-transform: none;
        }

        .mb15 
        {
            margin-bottom: 15px !important;
        }

        .srch-panel 
        {
            border: 1px #ccc solid;
            margin-top: 30px;
            padding: 20px;
            border-radius: 4px;
            padding-top: 40px;
            position: relative;
        }

         .srch-panel h4 
          {
             position: absolute;
             top: -21px;
             left: 20px;
             background-color: #fff;
             padding: 0 12px;
             font-size: 20px;
                
          }

        ul#programme li a
        {
            padding: 8px 25px;
            text-align: left;
            display: block;
            height: 60px;
        }

        ul#programme li:before 
        {
            content: "\e055";
            font-family: "feather";
            position: absolute;
            top: 6px;
        }

        .prog-list 
        {
            display: none;
        }

        /*.modal-body {
        height: 75% !important;
        overflow-y: scroll !important;
    }*/

        .modal-footer 
        {
            text-align: center !important;
        }

        #programme li 
        {
            list-style: none !important;
        }

            #programme li a 
            {
                color: #000 !important;
            }

        .swal2-container {
            z-index: 99999999;
            position: relative;
        }

        .select2-container--default .select2-selection--single .select2-selection__arrow 
        {
            height: 34px;
        }

        .select2-container--default .select2-selection--single .select2-selection__rendered 
        {
            line-height: 34px;
        }

        /*.select2-container--default .select2-selection--single {
            width: 100%;
            height: 34px;
        }

        .select2-container {
            width: 100% !important;
        }*/

        body {
            font-family: Tahoma, Geneva, sans-serif;
            font-size: 11px;
            line-height: initial;
            color: #666;
            background-color: #2e2e2e;
        }

        input[type="text"].form-control 
        {
            color: #555;
            font-size: 14px;
            height: 34px;
            padding: 6px 12px;
            border: 1px solid #aaa;
            box-shadow: none;
        }

        .modal-header .close {
            font-size: 20px;
        }

        .search_bar 
        {
            width: 253px;
        }

            .search_bar .btn 
            {
                padding: 0;
            }

            .search_bar .input 
            {
                width: 175px;
                line-height: 21px;
                height: 27px;
            }

        .has-class 
        {
            color: red;
        }

        table.dataTable {
            padding: 20px 0 !important;
        }

            table.dataTable thead th 
            {
                border-top: 1px solid #ddd !important;
            }

            table.dataTable thead th, table.dataTable thead td 
            {
                line-height: 1.42857143 !important;
                padding: 8px !important;
            }

        table thead th 
        {
            border-top: 1px solid #ddd !important;
        }

        .dataTables_wrapper .dataTables_filter input 
        {
            padding: 5px;
            border-radius: 4px;
        }

        .error 
        {
            color: red;
        }

        .card 
        {
            margin-top: 10px;
            font-weight: 400;
            border: 0;
            -webkit-box-shadow: 0 2px 5px 0 rgb(0 0 0 / 16%), 0 2px 10px 0 rgb(0 0 0 / 12%);
            box-shadow: 0 2px 5px 0 rgb(0 0 0 / 16%), 0 2px 10px 0 rgb(0 0 0 / 12%);
            position: relative;
            display: -ms-flexbox;
            display: flex;
            -ms-flex-direction: column;
            flex-direction: column;
            min-width: 0;
            word-wrap: break-word;
            background-color: #fff;
            background-clip: border-box;
            border: 1px solid rgba(0,0,0,0.125);
            border-radius: .25rem;
        }

        .card-body 
        {
            padding-top: 1.5rem;
            padding-bottom: 1.5rem;
            border-radius: 0 !important;
            flex: 1 1 auto;
            min-height: 1px;
            padding: 1.25rem;
        }

        .card-title 
        {
            margin-bottom: .75rem;
            font-weight: 400;
            font-size: 1.25rem;
        }

        .card .card-body .card-text 
        {
            font-size: .9rem;
            font-weight: 400;
            color: #747373;
        }

        .tab8 
        {
            display: inline-block;
            margin-left: 120px;
        }

        .includeAllBtn {
            padding: 3px 9px;
            font-size: 11px;
        }

        #addModal .modal-backdrop.in 
        {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
        }

        .mt20 
        {
            margin-top: 20px;
        }

        .mt10 
        {
            margin-top: 10px;
        }

        .fs12 
        {
            font-size: 12px;
        }

        label.error 
        {
            bottom: -6px;
            left: 20px;
            position: absolute;
        }

        .health-insurance .tab-content 
        {
            border: 1px #ddd solid;
            border-top: none;
            padding: 20px;
        }

        .btnclass 
        {
            height: 40px;
            width: 100px;
        }


        .RadComboBox .rcbDropDown {
    position: absolute !important;
    top: 100% !important;  /* Places dropdown below */
}
        .RadComboBox .rcbDropDown {
    z-index: 1000; /* Ensure it's above other elements */
}

    </style>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="Server">
    <table align="center" bgcolor="#cccccc" border="0" cellpadding="1" cellspacing="1"
        width="100%">
        <tr>
            <td align="center" class="form_header">Outcome Based Planner Master</td>
        </tr>
        <tr>
            <td align="center" class="input_form_caption_td">
                <%--  <asp:Label ID="Label2442" runat="server" Text="Session :"></asp:Label>
                <asp:DropDownList ID="ddlSessionMaster" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlSessionMaster_SelectedIndexChanged" OnDataBound="ddlSessionMaster_DataBound" Width="250px"></asp:DropDownList>--%>
                <asp:Label ID="Label2443" runat="server" Text="Division :"></asp:Label>
                <asp:DropDownList ID="ddlDivisionMaster" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlDivisionMaster_SelectedIndexChanged" OnDataBound="ddlDivisionMaster_DataBound" Width="250px"></asp:DropDownList>

            </td>
        </tr>
        <tr>
            <td class="input_form_caption_td">
                <cc1:TabContainer ID="TabContainer1" runat="server" ActiveTabInd3x="2" Width="100%" ActiveTabIndex="2">
                    <cc1:TabPanel ID="TabPanel1" runat="server" HeaderText="TabPanel1">
                        <ContentTemplate>
                            <asp:UpdatePanel ID="UpdatePanel1" runat="server">
                                <ContentTemplate>
                                    <script type="text/javascript" src="js/jquery-2.1.3.min.js"></script>
                                    <script type="text/javascript" src="js/jquery-ui-1.12.1.min.js"></script>
                                    <script type="text/javascript" src="Repository/datatables/js/datatables.min.js"></script>
                                    <link href="css/jquery-ui-1.12.1.min.css" rel="stylesheet" />
                                    <link href="Repository/datatables/css/datatables.min.css" rel="stylesheet" />
                                    <link href="js1/sweetalert.css" rel="stylesheet" />
                                    <script src="js1/sweetalert.min.js"></script>
                                    <script type="text/javascript">
                                         function setCriteriaId(Id) {
                                              $('#hdnCriteriaId').val(Id);
                                         }
                                         function setCriteriaIdandDesc(CriteriaId, desc, Weightage) {
                                              //debugger;
                                              //alert(desc);
                                              $('#hdnCriteriaId').val(CriteriaId);
                                              $('#txtCriteria').val(desc);
                                              $('#txtWeightageCriteria').val(Weightage);

                                         }
                                         function GetCriterias() {
                                              // alert('indicator');
                                              //debugger;
                                              if ($.fn.DataTable.isDataTable('#tblCriteria')) {
                                                   $('#tblCriteria').DataTable().destroy();
                                              }
                                              var Division = $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel1_ddlCriteriaDivision').val();
                                              // alert(Division);
                                              if (Division != null && Division != 'Select') {
                                                   $.ajax({
                                                        type: "POST",
                                                        url: "frmCriteriaMaster.aspx/GetCriterias",
                                                        data: JSON.stringify({
                                                             divId: Division
                                                        }),
                                                        contentType: "application/json; charset=utf-8",
                                                        dataType: "json",
                                                        success: OnSuccessCriteria,
                                                        failure: function (response) {
                                                             alert(response.d);
                                                        },
                                                        error: function (response) {
                                                             alert(response.d);
                                                        }


                                                   });
                                              }
                                         }
                                         function OnSuccessCriteria(response) {
                                              //debugger;
                                              //  alert('su');
                                              $("#tblCriteria").DataTable(
                                                   {
                                                        dom: 'Bfrtip',
                                                        bLengthChange: true,
                                                        lengthMenu: [[50, 100, -1], [50, 100, "All"]],
                                                        bFilter: true,
                                                        bSort: true,
                                                        bPaginate: true,
                                                        data: response.d,

                                                        columns: [{ "data": "Id" },
                                                        { "data": "CriteriaDesc" },
                                                        {
                                                             "data": "ISActive",
                                                             "render": function (data, type, row, meta) {
                                                                  if (type === 'display') {
                                                                       if (row.ISActive == true)
                                                                            data = '<a href="javascript:void(0)" class="btn btn-sm btn-warning" data-toggle="modal" onclick="setCriteriaId(' + "'" + row.Id + "'" + ')" data-target="#CriteriaModal"  data-backdrop="static" data-keyboard="false">Deactive</a> <a href="javascript:void(0)" class="btn btn-sm btn-info" data-toggle="modal" onclick="setCriteriaIdandDesc(' + "'" + row.Id + "'," + "'" + row.CriteriaDesc.replace(/\s{2,}/g, ' ').trim().replace(/\r/g, "").replace(/\n/g, "").replace(/'/g, "") + "'" + ",'" + row.Weightage + "'" + ')" data-target="#RenameCriteriaModal"  data-backdrop="static" data-keyboard="false">Edit</a>'
                                                                       else
                                                                            data = '<a href="javascript:void(0)" class="btn btn-sm btn-danger" data-toggle="modal" onclick="setCriteriaId(' + "'" + row.Id + "'" + ')" data-target="#CriteriaModalActive"  data-backdrop="static" data-keyboard="false">Active</a> '


                                                                  }
                                                                  return data;
                                                             }
                                                        }

                                                        ],
                                                        columnDefs: [
                                                             { width: 150, targets: 2 }
                                                        ],

                                                        buttons: [{
                                                             extend: 'excel',
                                                             text: 'Export to Excel',
                                                             className: 'btn btn-warning',
                                                             filename: 'Criteria',
                                                             exportOptions: { columns: [0, 1], modifier: { page: 'all' /*'current'*/ } }

                                                        }]
                                                   }).columns.adjust();

                                         };



                                         function Criterias() {
                                              $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel1_ddlCriteriaDivision').change(function (e) {
                                                   // alert('infn');
                                                   e.preventDefault();
                                                   GetCriterias();

                                                   $('#tblCriteria').show();

                                              })
                                         }
                                         function RenameCriteria() {
                                              $('#btnRenameCriteria').click(function (e) {

                                                   e.preventDefault();

                                                   swal({
                                                        title: "Confirm Rename",
                                                        text: "Are you sure to rename this Criteria",
                                                        closeOnConfirm: true,
                                                        closeOnCancel: true,
                                                        showCancelButton: true,
                                                        confirmButtonText: "Yes",
                                                        cancelButtonText: "No"

                                                   },
                                                        function (isConfirm) {
                                                             if (isConfirm) {
                                                                  var Desc = $('#txtCriteria').val();
                                                                  var CriteriaId = $('#hdnCriteriaId').val();
                                                                  var DivId = $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel1_ddlCriteriaDivision').val();
                                                                  //var Weightage = $('#txtWeightageCriteria').val();
                                                                  //if (Weightage == "0") {
                                                                  //    alert('Please enter numeric value for weightage and greater than 0.');
                                                                  //    return false;
                                                                  //}
                                                                  //var reg = new RegExp('^[0-9]*$');
                                                                  //if (reg.test(Weightage) == false) {
                                                                  //    alert('Please enter numeric value for weightage and greater than 0.');
                                                                  //    return false;
                                                                  //}
                                                                  if (Desc != "") {
                                                                       $.ajax({
                                                                            type: "POST",
                                                                            url: "frmCriteriaMaster.aspx/RenameCriteria",
                                                                            contentType: "application/json; charset=utf-8",
                                                                            dataType: "json",
                                                                            data: JSON.stringify({
                                                                                 CriteriaId: CriteriaId, Desc: Desc, DivId: DivId
                                                                            }),
                                                                            success: function (data) {
                                                                                 //debugger;
                                                                                 var msg = data.d;
                                                                                 if (msg == "Rename successfuly") {
                                                                                      setTimeout(function () {
                                                                                           swal({ title: "", text: msg, type: "success" },
                                                                                                function () {
                                                                                                     GetCriterias();

                                                                                                })
                                                                                      }, 1000)
                                                                                 }
                                                                                 else
                                                                                      alert(msg);

                                                                            },
                                                                            failure: function (response) {
                                                                                 alert(response.d);
                                                                            },
                                                                            error: function (response) {
                                                                                 alert(response.d);
                                                                            }
                                                                       })
                                                                  }
                                                                  else {
                                                                       alert('Enter value in description');
                                                                  }

                                                             }
                                                        });

                                              })
                                         }
                                         function DeleteCriteria() {
                                              $('#btnDeleteCriteria').click(function (e) {
                                                   e.preventDefault();
                                                   swal({
                                                        title: "Confirm Delete",
                                                        text: "Are you sure to delete this criteria",
                                                        closeOnConfirm: true,
                                                        closeOnCancel: true,
                                                        showCancelButton: true,
                                                        confirmButtonText: "Yes",
                                                        cancelButtonText: "No"

                                                   },
                                                        function (isConfirm) {
                                                             if (isConfirm) {
                                                                  var Reason = $('#txtCriteriaReason').val();
                                                                  var CriteriaId = $('#hdnCriteriaId').val();
                                                                  if (Reason != "") {
                                                                       $.ajax({
                                                                            type: "POST",
                                                                            url: "frmCriteriaMaster.aspx/DeleteCriteria",
                                                                            contentType: "application/json; charset=utf-8",
                                                                            dataType: "json",
                                                                            data: JSON.stringify({
                                                                                 CriteriaId: CriteriaId, Reason: Reason, IsActive: 0
                                                                            }),
                                                                            success: function (data) {
                                                                                 //debugger;
                                                                                 var msg = data.d;
                                                                                 if (msg == "Deactive successfuly") {
                                                                                      setTimeout(function () {
                                                                                           swal({ title: "", text: msg, type: "success" },
                                                                                                function () {
                                                                                                     GetCriterias();

                                                                                                })
                                                                                      }, 1000)
                                                                                 }
                                                                                 else
                                                                                      alert(msg);

                                                                            },
                                                                            failure: function (response) {
                                                                                 alert(response.d);
                                                                            },
                                                                            error: function (response) {
                                                                                 alert(response.d);
                                                                            }
                                                                       })
                                                                  }
                                                                  else {
                                                                       alert('Enter Reason');
                                                                  }

                                                             }
                                                        });
                                              })
                                         }
                                         function ActiveCriteria() {
                                              $('#btnActiveCriteria').click(function (e) {
                                                   e.preventDefault();
                                                   swal({
                                                        title: "Confirm Delete",
                                                        text: "Are you sure to active this criteria",
                                                        closeOnConfirm: true,
                                                        closeOnCancel: true,
                                                        showCancelButton: true,
                                                        confirmButtonText: "Yes",
                                                        cancelButtonText: "No"

                                                   },
                                                        function (isConfirm) {
                                                             if (isConfirm) {
                                                                  var Reason = $('#txtCriteriaReasonActive').val();
                                                                  var CriteriaId = $('#hdnCriteriaId').val();
                                                                  if (Reason != "") {
                                                                       $.ajax({
                                                                            type: "POST",
                                                                            url: "frmCriteriaMaster.aspx/DeleteCriteria",
                                                                            contentType: "application/json; charset=utf-8",
                                                                            dataType: "json",
                                                                            data: JSON.stringify({
                                                                                 CriteriaId: CriteriaId, Reason: Reason, IsActive: 1
                                                                            }),
                                                                            success: function (data) {
                                                                                 //debugger;
                                                                                 var msg = data.d;
                                                                                 if (msg == "Active successfuly") {
                                                                                      setTimeout(function () {
                                                                                           swal({ title: "", text: msg, type: "success" },
                                                                                                function () {
                                                                                                     GetCriterias();

                                                                                                })
                                                                                      }, 1000)
                                                                                 }
                                                                                 else
                                                                                      alert(msg);

                                                                            },
                                                                            failure: function (response) {
                                                                                 alert(response.d);
                                                                            },
                                                                            error: function (response) {
                                                                                 alert(response.d);
                                                                            }
                                                                       })
                                                                  }
                                                                  else {
                                                                       alert('Enter Reason');
                                                                  }

                                                             }
                                                        });
                                              })
                                         }
                                         function ShowCriteria() {
                                              GetCriterias();
                                              //var count = $('#tblMetric tr').length;
                                              //alert(count);
                                              //if (count > 1) {
                                              $('#tblCriteria').show();
                                              //}

                                         }
                                    </script>
                                    <script type="text/javascript" language="javascript">
                                         Sys.Application.add_load(Criterias);
                                         Sys.Application.add_load(setCriteriaId);
                                         Sys.Application.add_load(setCriteriaIdandDesc);
                                         Sys.Application.add_load(DeleteCriteria);
                                         Sys.Application.add_load(ActiveCriteria);
                                         Sys.Application.add_load(RenameCriteria);
                                         Sys.Application.add_load(ShowCriteria);
                                    </script>
                                    <table align="center" bgcolor="#cccccc" border="0" cellpadding="1" cellspacing="1"
                                        width="100%">
                                        <tr>
                                            <td align="right" class="input_form_caption_td">
                                                <asp:LinkButton ID="lnkExportCriteria" runat="server" OnClick="lnkExportCriteria_Click" Visible="False">Download Data</asp:LinkButton>
                                                &nbsp;<asp:HyperLink ID="HyperLink1" runat="server" NavigateUrl="~/Forms/StrategicStages/Criteria Master.xls" Target="_blank">Download Format</asp:HyperLink>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" class="input_form_caption_td">
                                                <table align="center" bgcolor="#cccccc" border="0" cellpadding="1" cellspacing="1"
                                                    width="100%">
                                                   
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label242" runat="server" Text="Division :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlCriteriaDivision" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlCriteriaDivision_SelectedIndexChanged" OnDataBound="ddlCriteriaDivision_DataBound" Width="250px"></asp:DropDownList><asp:RequiredFieldValidator ID="RequiredFieldValidator1" runat="server" ControlToValidate="ddlCriteriaDivision" ErrorMessage="Please select division" InitialValue="0" ValidationGroup="1">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label2439" runat="server" Text="Upload Category :"></asp:Label>
                                                        </td>
                                                        <td class="input_form_caption_td">
                                                            <asp:RadioButtonList ID="rblCriteriaOption" runat="server" AutoPostBack="True" OnSelectedIndexChanged="rblCriteriaOption_SelectedIndexChanged" RepeatDirection="Horizontal" RepeatLayout="Flow">
                                                                <asp:ListItem Value="S">Single Entry</asp:ListItem>
                                                                <asp:ListItem Value="M">Multiple Entries</asp:ListItem>
                                                            </asp:RadioButtonList>
                                                            <asp:RequiredFieldValidator ID="RequiredFieldValidator27" runat="server" ControlToValidate="rblCriteriaOption" ErrorMessage="Please select upload category" ValidationGroup="1">*</asp:RequiredFieldValidator>
                                                        </td>
                                                    </tr>
                                                    <tr id="TRCriteriaSingle" runat="server" visible="false">
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label2440" runat="server" Text="Criteria descriptions :"></asp:Label>
                                                        </td>
                                                        <td class="input_form_caption_td">
                                                            <asp:TextBox ID="txtCriteria1" runat="server" TextMode="MultiLine" Width="250px" pattern="^[ A-Za-z0-9-$(),]*$"></asp:TextBox>
                                                            <asp:RequiredFieldValidator ID="RequiredFieldValidator25" runat="server" ControlToValidate="txtCriteria1" ErrorMessage="Please enter criteria" ValidationGroup="1">*</asp:RequiredFieldValidator>
                                                            <asp:RegularExpressionValidator ID="ReV" runat="server" ControlToValidate="txtCriteria1" ErrorMessage="Special Characters are not allowed except -&()," ValidationExpression="^[ A-Za-z0-9-&(),]*$" ValidationGroup="1"></asp:RegularExpressionValidator>
                                                        </td>
                                                    </tr>
                                                  <%--  <tr id="TRCriteriaSingle1" runat="server" visible="false">
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label4" runat="server" Text="Weightage :"></asp:Label>
                                                        </td>
                                                        <td class="input_form_caption_td">
                                                            <asp:TextBox ID="txtCriteriaWeightage" runat="server" Width="250px"></asp:TextBox>
                                                            <asp:RequiredFieldValidator ID="RequiredFieldValidator26" runat="server" ControlToValidate="txtCriteriaWeightage" ErrorMessage="Please select weightage" ValidationGroup="1">*</asp:RequiredFieldValidator>
                                                            <asp:RegularExpressionValidator ID="RegularExpressionValidator1"
                                                                ControlToValidate="txtCriteriaWeightage" runat="server" ErrorMessage="Only Numbers greater than zero are allowed" ValidationGroup="1" ValidationExpression="[1-9]\d*$"></asp:RegularExpressionValidator>
                                                        </td>
                                                    </tr>--%>
                                                    <tr id="TRCriteriaMultiple" runat="server" visible="false">
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label2411" runat="server" Text="Please select file :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:FileUpload ID="fuUploadCriteria" runat="server" Width="250px" /><asp:Button ID="btnUploadCriteria" runat="server" Height="30px" Width="100px" OnClick="btnUploadFee_Click" Text="Upload" ValidationGroup="2" /></td>
                                                    </tr>
                                                    <tr id="TRCriteriaOfflinePnl" runat="server" visible="false">
                                                        <td class="input_form_caption_td" colspan="2">
                                                            <asp:Panel ID="Panel1" runat="server" Height="200px" ScrollBars="Both">
                                                                <asp:GridView ID="grdError1" runat="server" ShowHeader="False">
                                                                    <Columns>
                                                                        <asp:TemplateField>
                                                                            <ItemTemplate><strong><span style="color: #ff0000">Error :</span></strong></ItemTemplate>
                                                                        </asp:TemplateField>
                                                                    </Columns>
                                                                </asp:GridView>
                                                                <asp:GridView ID="grdCriteria" runat="server" AutoGenerateColumns="False" CellPadding="1" CellSpacing="1" Width="100%">
                                                                    <Columns>
                                                                        <asp:TemplateField HeaderText="Criteria" SortExpression="Criteria">
                                                                            <EditItemTemplate>
                                                                                <asp:TextBox ID="TextBox1" runat="server" Text='<%# Bind("Criteria") %>'></asp:TextBox>
                                                                            </EditItemTemplate>
                                                                            <ItemTemplate>
                                                                                <asp:Label ID="lblCriteria" runat="server" Text='<%# Bind("Criteria") %>'></asp:Label>
                                                                            </ItemTemplate>
                                                                        </asp:TemplateField>
                                                                     <%--   <asp:TemplateField HeaderText="Weightage" SortExpression="Weightage">
                                                                            <EditItemTemplate>
                                                                                <asp:TextBox ID="TextBox2" runat="server" Text='<%# Bind("Weightage") %>'></asp:TextBox>
                                                                            </EditItemTemplate>
                                                                            <ItemTemplate>
                                                                                <asp:Label ID="lblWeightage" runat="server" Text='<%# Bind("Weightage") %>'></asp:Label>
                                                                            </ItemTemplate>
                                                                        </asp:TemplateField>--%>
                                                                    </Columns>
                                                                </asp:GridView>
                                                            </asp:Panel>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" class="input_form_caption_td">
                                                <asp:Button ID="btnSaveCriteria" runat="server" OnClick="btnSaveCriteria_Click" Height="30px" Width="100px" Text="Submit" ValidationGroup="1" /><asp:Button ID="btnResetCriteria" Height="30px" Width="100px" runat="server" OnClick="btnResetCriteria_Click" Text="Reset" CausesValidation="False" />
                                                <asp:ValidationSummary ID="ValidationSummary2" runat="server" ShowMessageBox="True" ShowSummary="False" ValidationGroup="2" />
                                                <asp:ValidationSummary ID="ValidationSummary1" runat="server" ShowMessageBox="True" ShowSummary="False" ValidationGroup="1" />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" class="input_form_caption_td">
                                                <asp:Label ID="lblerror0" runat="server"></asp:Label>
                                            </td>
                                        </tr>
                                    </table>
                                    <table id="tblCriteria" class="table" style="display: none; width: 100%">
                                        <thead>
                                            <tr>
                                                <th>Id</th>
                                                <th>Description</th>
                                                
                                                <th>Deactive/Edit </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        </tbody>
                                    </table>

                                    <input type="hidden" id="hdnCriteriaId" value="0" />
                                    <input type="hidden" id="hdnCriteriaDesc" value="0" />
                                    <!-- Modal -->
                                    <div class="modal fade" id="CriteriaModal" tabindex="-1" role="dialog" aria-labelledby="CriteriaModalLabel" aria-hidden="true">
                                        <div class="modal-dialog" role="document">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="CriteriaModalLabel">Deactive Criteria</h5>
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div class="modal-body">
                                                    <label>Enter Reason </label>
                                                    <input type="text" id="txtCriteriaReason" class="form-control" />
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-primary btn-sm" id="btnDeleteCriteria">Save changes</button>
                                                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="modal fade" id="CriteriaModalActive" tabindex="-1" role="dialog" aria-labelledby="CriteriaModalLabelActive" aria-hidden="true">
                                        <div class="modal-dialog" role="document">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="CriteriaModalLabelActive">Active Criteria</h5>
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div class="modal-body">
                                                    <label>Enter Reason </label>
                                                    <input type="text" id="txtCriteriaReasonActive" class="form-control" />
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-primary btn-sm" id="btnActiveCriteria">Save changes</button>
                                                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="modal fade" id="RenameCriteriaModal" tabindex="-1" role="dialog" aria-labelledby="RenameCriteriaModalLabel" aria-hidden="true">
                                        <div class="modal-dialog" role="document">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="RenameCriteriaModalLabel">Edit description of Criteria</h5>
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div class="modal-body">
                                                    <div class="form-group">
                                                        <label>Rename Criteria Description</label>
                                                        <textarea class="form-control" rows="5" name="txtCriteria" id="txtCriteria" pattern="/^[ A-Za-z0-9-$(),]*$/"></textarea>
                                                    </div>
                                                     <%--<div class="form-group">
                                                        <label>Weightage</label>
                                                       <input type="text" id="txtWeightageCriteria" class="form-control" />
                                                    </div>--%>

                                                    <%--<input type="text" id="txtMetric"  />--%>
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-primary btn-sm" id="btnRenameCriteria">Save changes</button>
                                                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ContentTemplate>
                                <Triggers>
                                    <asp:PostBackTrigger ControlID="lnkExportCriteria" />
                                    <asp:PostBackTrigger ControlID="btnUploadCriteria" />
                                </Triggers>
                            </asp:UpdatePanel>

                        </ContentTemplate>
                        <HeaderTemplate>
                            Criteria Master
                        
                        </HeaderTemplate>

                    </cc1:TabPanel>
                    <cc1:TabPanel ID="TabPanel2" runat="server" HeaderText="TabPanel2">

                        <ContentTemplate>
                            <asp:UpdatePanel ID="UpdatePanel2" runat="server">

                                <ContentTemplate>

                                    <script type="text/javascript" src="js/jquery-2.1.3.min.js"></script>
                                    <script type="text/javascript" src="js/jquery-ui-1.12.1.min.js"></script>
                                    <script type="text/javascript" src="Repository/datatables/js/datatables.min.js"></script>
                                    <link href="css/jquery-ui-1.12.1.min.css" rel="stylesheet" />
                                    <link href="Repository/datatables/css/datatables.min.css" rel="stylesheet" />
                                    <link href="js1/sweetalert.css" rel="stylesheet" />
                                    <script src="js1/sweetalert.min.js"></script>
                                    <script type="text/javascript">
                                         function setIndicatorId(Id) {
                                              $('#hdnIndicatorId').val(Id);
                                         }
                                         function setIndicatorIdandDesc(IndicatorId, desc, IndicatorWeightage) {
                                              //debugger;
                                              //alert(desc);
                                              $('#hdnIndicatorId').val(IndicatorId);
                                              $('#txtIndicator').val(desc);
                                              $('#txtWeightageIndicator').val(IndicatorWeightage);

                                         }
                                         function GetIndicators() {
                                              // alert('indicator');
                                              //debugger;
                                              if ($.fn.DataTable.isDataTable('#tblIndicator')) {
                                                   $('#tblIndicator').DataTable().destroy();
                                              }
                                              var Criteria = $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel2_ddlCriteriaList').val();
                                              // alert(Indicator);
                                              if (Criteria != null && Criteria != 'Select') {
                                                   $.ajax({
                                                        type: "POST",
                                                        url: "frmCriteriaMaster.aspx/GetIndicators",
                                                        data: JSON.stringify({
                                                             CriteriaId: Criteria
                                                        }),
                                                        contentType: "application/json; charset=utf-8",
                                                        dataType: "json",
                                                        success: OnSuccessIndicator,
                                                        failure: function (response) {
                                                             alert(response.d);
                                                        },
                                                        error: function (response) {
                                                             alert(response.d);
                                                        }

                                                   });
                                              }
                                         }
                                         function OnSuccessIndicator(response) {
                                              //debugger;
                                              //  alert('su');
                                              $("#tblIndicator").DataTable(
                                                   {
                                                        dom: 'Bfrtip',
                                                        bLengthChange: true,
                                                        lengthMenu: [[50, 100, -1], [50, 100, "All"]],
                                                        bFilter: true,
                                                        bSort: true,
                                                        bPaginate: true,
                                                        data: response.d,

                                                        columns: [{ "data": "Id" },
                                                        { "data": "IndicatorDesc" },
                                                        {
                                                             "data": "ISActive",
                                                             "render": function (data, type, row, meta) {
                                                                  if (type === 'display') {
                                                                       if (row.ISActive == true)
                                                                            data = '<a href="javascript:void(0)" class="btn btn-sm btn-warning" data-toggle="modal" onclick="setIndicatorId(' + "'" + row.Id + "'" + ')" data-target="#IndicatorModal"  data-backdrop="static" data-keyboard="false">Deactive</a> <a href="javascript:void(0)" class="btn btn-sm btn-info" data-toggle="modal" onclick="setIndicatorIdandDesc(' + "'" + row.Id + "'," + "'" + row.IndicatorDesc.replace(/\s{2,}/g, ' ').trim().replace(/\r/g, "").replace(/\n/g, "").replace(/'/g, "") + "'" + ",'" + row.IndicatorWeightage + "'" + ')" data-target="#RenameIndicatorModal"  data-backdrop="static" data-keyboard="false">Edit</a>'
                                                                       else
                                                                            data = '<a href="javascript:void(0)" class="btn btn-sm btn-danger" data-toggle="modal" onclick="setIndicatorId(' + "'" + row.Id + "'" + ')" data-target="#IndicatorModalActive"  data-backdrop="static" data-keyboard="false">Active</a> '

                                                                  }
                                                                  return data;
                                                             }
                                                        }

                                                        ],
                                                        columnDefs: [
                                                             { width: 30, targets: 0 },
                                                             { width: 150, targets: 2 }
                                                        ],

                                                        buttons: [{
                                                             extend: 'excel',
                                                             text: 'Export to Excel',
                                                             className: 'btn btn-warning',
                                                             filename: 'Indicator',
                                                             exportOptions: { columns: [0, 1], modifier: { page: 'all' /*'current'*/ } }

                                                        }]
                                                   }).columns.adjust();

                                         };



                                         function Indicators() {
                                              $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel2_ddlCriteriaList').change(function (e) {
                                                   // alert('infn');
                                                   e.preventDefault();
                                                   GetIndicators();

                                                   $('#tblIndicator').show();

                                              })
                                         }
                                         function RenameIndicator() {
                                              $('#btnRenameIndicator').click(function (e) {

                                                   e.preventDefault();

                                                   swal({
                                                        title: "Confirm Rename",
                                                        text: "Are you sure to rename this indicator",
                                                        closeOnConfirm: true,
                                                        closeOnCancel: true,
                                                        showCancelButton: true,
                                                        confirmButtonText: "Yes",
                                                        cancelButtonText: "No"

                                                   },
                                                        function (isConfirm) {
                                                             if (isConfirm) {
                                                                  var Desc = $('#txtIndicator').val();
                                                                  var IndicatorId = $('#hdnIndicatorId').val();
                                                                  // var IndicatorWeightage = $('#txtWeightageIndicator').val();
                                                                  var IndicatorCriteriaId = $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel2_ddlCriteriaList').val();
                                                                  //if (IndicatorWeightage == "0") {
                                                                  //    alert('Please enter numeric value for weightage and greater than 0.');
                                                                  //    return false;
                                                                  //}
                                                                  //var reg = new RegExp('^[0-9]*$');
                                                                  //if (reg.test(IndicatorWeightage) == false) {
                                                                  //    alert('Please enter numeric value for weightage and greater than 0.');
                                                                  //    return false;
                                                                  //}
                                                                  if (Desc != "") {
                                                                       $.ajax({
                                                                            type: "POST",
                                                                            url: "frmCriteriaMaster.aspx/RenameIndicator",
                                                                            contentType: "application/json; charset=utf-8",
                                                                            dataType: "json",
                                                                            data: JSON.stringify({
                                                                                 IndicatorId: IndicatorId, Desc: Desc, IndicatorCriteriaId: IndicatorCriteriaId
                                                                            }),
                                                                            success: function (data) {
                                                                                 //debugger;
                                                                                 var msg = data.d;
                                                                                 if (msg == "Rename successfuly") {
                                                                                      setTimeout(function () {
                                                                                           swal({ title: "", text: msg, type: "success" },
                                                                                                function () {
                                                                                                     GetIndicators();

                                                                                                })
                                                                                      }, 1000)
                                                                                 }
                                                                                 else
                                                                                      alert(msg);

                                                                            },
                                                                            failure: function (response) {
                                                                                 alert(response.d);
                                                                            },
                                                                            error: function (response) {
                                                                                 alert(response.d);
                                                                            }
                                                                       })
                                                                  }
                                                                  else {
                                                                       alert('Enter value in description');
                                                                  }

                                                             }
                                                        });

                                              })
                                         }
                                         function DeleteIndicator() {
                                              $('#btnDeleteIndicator').click(function (e) {
                                                   e.preventDefault();
                                                   swal({
                                                        title: "Confirm Delete",
                                                        text: "Are you sure to delete this indicator",
                                                        closeOnConfirm: true,
                                                        closeOnCancel: true,
                                                        showCancelButton: true,
                                                        confirmButtonText: "Yes",
                                                        cancelButtonText: "No"

                                                   },
                                                        function (isConfirm) {
                                                             if (isConfirm) {
                                                                  var Reason = $('#txtIndicatorReason').val();
                                                                  var IndicatorId = $('#hdnIndicatorId').val();
                                                                  if (Reason != "") {
                                                                       $.ajax({
                                                                            type: "POST",
                                                                            url: "frmCriteriaMaster.aspx/DeleteKeyIndicator",
                                                                            contentType: "application/json; charset=utf-8",
                                                                            dataType: "json",
                                                                            data: JSON.stringify({
                                                                                 IndicatorId: IndicatorId, Reason: Reason, IsActive: 0
                                                                            }),
                                                                            success: function (data) {
                                                                                 //debugger;
                                                                                 var msg = data.d;
                                                                                 if (msg == "Deactive successfuly") {
                                                                                      setTimeout(function () {
                                                                                           swal({ title: "", text: msg, type: "success" },
                                                                                                function () {
                                                                                                     GetIndicators();

                                                                                                })
                                                                                      }, 1000)
                                                                                 }
                                                                                 else
                                                                                      alert(msg);

                                                                            },
                                                                            failure: function (response) {
                                                                                 alert(response.d);
                                                                            },
                                                                            error: function (response) {
                                                                                 alert(response.d);
                                                                            }
                                                                       })
                                                                  }
                                                                  else {
                                                                       alert('Enter Reason');
                                                                  }

                                                             }
                                                        });
                                              })
                                         }
                                         function ActiveIndicator() {
                                              $('#btnActiveIndicator').click(function (e) {
                                                   e.preventDefault();
                                                   swal({
                                                        title: "Confirm Active",
                                                        text: "Are you sure to active this indicator",
                                                        closeOnConfirm: true,
                                                        closeOnCancel: true,
                                                        showCancelButton: true,
                                                        confirmButtonText: "Yes",
                                                        cancelButtonText: "No"

                                                   },
                                                        function (isConfirm) {
                                                             if (isConfirm) {
                                                                  var Reason = $('#txtIndicatorReasonActive').val();
                                                                  var IndicatorId = $('#hdnIndicatorId').val();
                                                                  if (Reason != "") {
                                                                       $.ajax({
                                                                            type: "POST",
                                                                            url: "frmCriteriaMaster.aspx/DeleteKeyIndicator",
                                                                            contentType: "application/json; charset=utf-8",
                                                                            dataType: "json",
                                                                            data: JSON.stringify({
                                                                                 IndicatorId: IndicatorId, Reason: Reason, IsActive: 1
                                                                            }),
                                                                            success: function (data) {
                                                                                 //debugger;
                                                                                 var msg = data.d;
                                                                                 if (msg == "Active successfuly") {
                                                                                      setTimeout(function () {
                                                                                           swal({ title: "", text: msg, type: "success" },
                                                                                                function () {
                                                                                                     GetIndicators();

                                                                                                })
                                                                                      }, 1000)
                                                                                 }
                                                                                 else
                                                                                      alert(msg);

                                                                            },
                                                                            failure: function (response) {
                                                                                 alert(response.d);
                                                                            },
                                                                            error: function (response) {
                                                                                 alert(response.d);
                                                                            }
                                                                       })
                                                                  }
                                                                  else {
                                                                       alert('Enter Reason');
                                                                  }

                                                             }
                                                        });
                                              })
                                         }
                                         function ShowIndicator() {
                                              GetIndicators();
                                              //var count = $('#tblMetric tr').length;
                                              //alert(count);
                                              //if (count > 1) {
                                              $('#tblIndicator').show();
                                              //}

                                         }
                                    </script>
                                    <script type="text/javascript" language="javascript">
                                         Sys.Application.add_load(Indicators);
                                         Sys.Application.add_load(setIndicatorId);
                                         Sys.Application.add_load(setIndicatorIdandDesc);
                                         Sys.Application.add_load(DeleteIndicator);
                                         Sys.Application.add_load(ActiveIndicator);
                                         Sys.Application.add_load(RenameIndicator);
                                         Sys.Application.add_load(ShowIndicator);
                                    </script>
                                    <table align="center" bgcolor="#cccccc" border="0" cellpadding="1" cellspacing="1" width="100%">
                                        <tr>
                                            <td align="right" class="input_form_caption_td">
                                                <asp:LinkButton ID="lnkExportKi" runat="server" OnClick="lnkExportKi_Click" Visible="False">Download Data</asp:LinkButton>
                                                &nbsp;<asp:HyperLink ID="HyperLink2" runat="server" NavigateUrl="~/Forms/StrategicStages/Key Indicator Master.xls" Target="_blank">Download Format</asp:HyperLink>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" class="input_form_caption_td">
                                                <table align="center" bgcolor="#cccccc" border="0" cellpadding="1" cellspacing="1" width="100%">
                                                    <%-- <tr>
                                                        <td class="input_form_caption_td" style="width: 20%;">
                                                            <asp:Label ID="Label2414" runat="server" Text="Session :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlSession" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlSession_SelectedIndexChanged1" OnDataBound="ddlSession_DataBound" Width="250px"></asp:DropDownList><asp:RequiredFieldValidator ID="RequiredFieldValidator4" runat="server" ControlToValidate="ddlSession" ErrorMessage="Please select session" InitialValue="0" ValidationGroup="5">*</asp:RequiredFieldValidator></td>
                                                    </tr>--%>
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label2412" runat="server" Text="Division :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlDivisionList" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlDivisionList_SelectedIndexChanged" OnDataBound="ddlDivisionList_DataBound" Width="250px"></asp:DropDownList><asp:RequiredFieldValidator ID="RequiredFieldValidator3" runat="server" ControlToValidate="ddlDivisionList" ErrorMessage="Please select division" InitialValue="0" ValidationGroup="5">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label2413" runat="server" Text="Criteria :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlCriteriaList" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlCriteriaList_SelectedIndexChanged" OnDataBound="ddlCriteriaList_DataBound" Width="250px"></asp:DropDownList><asp:RequiredFieldValidator ID="RequiredFieldValidator5" runat="server" ControlToValidate="ddlCriteriaList" ErrorMessage="Please select criteria" InitialValue="0" ValidationGroup="5">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label2419" runat="server" Text="Upload Category :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:RadioButtonList ID="rblIndicatorOption" runat="server" AutoPostBack="True" OnSelectedIndexChanged="rblIndicatorOption_SelectedIndexChanged" RepeatDirection="Horizontal" RepeatLayout="Flow">
                                                                <asp:ListItem Value="S">Single Entry</asp:ListItem>
                                                                <asp:ListItem Value="M">Multiple Entries</asp:ListItem>
                                                            </asp:RadioButtonList><asp:RequiredFieldValidator ID="RequiredFieldValidator10" runat="server" ControlToValidate="rblIndicatorOption" ErrorMessage="Please select upload category" ValidationGroup="5">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr id="KeySingle" runat="server" visible="False">
                                                        <td class="input_form_caption_td" runat="server">
                                                            <asp:Label ID="Label2415" runat="server" Text="Key Indicator  description :"></asp:Label></td>
                                                        <td class="input_form_caption_td" runat="server">
                                                            <asp:TextBox ID="txtKeyIndicator" runat="server" TextMode="MultiLine" Width="250px" MaxLength="200"></asp:TextBox>
                                                            <asp:RequiredFieldValidator ID="RequiredFieldValidator7" runat="server" ControlToValidate="txtKeyIndicator" ErrorMessage="Please enter Key Indicator" ValidationGroup="5">*</asp:RequiredFieldValidator>
                                                           <%-- <asp:RegularExpressionValidator ID="Rev2" runat="server" ValidationExpression="^[ A-Za-z0-9-&(),]*$" ControlToValidate="txtKeyIndicator" ErrorMessage="Special characters are not allowed except &_()" ValidationGroup="5"></asp:RegularExpressionValidator>--%>
                                                        </td>

                                                    </tr>
                                                   <%-- <tr id="KeySingle1" runat="server" visible="False">
                                                        <td class="input_form_caption_td" runat="server">
                                                            <asp:Label ID="Label1" runat="server" Text="Weightage :"></asp:Label></td>
                                                        <td class="input_form_caption_td" runat="server">
                                                            <asp:TextBox ID="txtIndicatorWeightage" runat="server" Width="250px"></asp:TextBox><asp:RequiredFieldValidator ID="RequiredFieldValidator8" runat="server" ControlToValidate="txtIndicatorWeightage" ErrorMessage="Please enter Weightage" ValidationGroup="5">*</asp:RequiredFieldValidator>
                                                            <asp:RegularExpressionValidator ID="RegularExpressionValidator2"
                                                                ControlToValidate="txtIndicatorWeightage" runat="server" ErrorMessage="Only Numbers greater than zero are allowed" ValidationGroup="5" ValidationExpression="[1-9]\d*$"></asp:RegularExpressionValidator>
                                                        </td>
                                                    </tr>--%>
                                                 <%--   <tr id="KeySingle2" runat="server" visible="False">
                                                        <td class="input_form_caption_td" runat="server">
                                                            <asp:Label ID="Label5" runat="server" Text="Source :"></asp:Label></td>
                                                        <td class="input_form_caption_td" runat="server">
                                                            <asp:TextBox ID="txtSource" runat="server" Width="250px" TextMode="MultiLine"></asp:TextBox><asp:RequiredFieldValidator ID="RequiredFieldValidator28" runat="server" ControlToValidate="txtSource" ErrorMessage="Please enter source" ValidationGroup="5">*</asp:RequiredFieldValidator></td>
                                                    </tr>--%>
                                                    <tr id="KeyMultiple" runat="server" visible="False">
                                                        <td class="input_form_caption_td" runat="server">
                                                            <asp:Label ID="Label2418" runat="server" Text="Upload File :"></asp:Label></td>
                                                        <td class="input_form_caption_td" runat="server">
                                                            <asp:FileUpload ID="fuKeyUpload" runat="server" Width="250px" /><asp:Button ID="btnKeyUpload" runat="server" Height="30px" Width="100px" OnClick="btnKeyUpload_Click1" Text="Upload" /></td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr id="TRKeyOfflinePnl" runat="server" visible="False">
                                            <td align="center" class="input_form_caption_td" runat="server">
                                                <asp:Panel ID="Panel3" runat="server" Height="200px" ScrollBars="Both">
                                                    <asp:GridView ID="grdError2" runat="server" ShowHeader="False">
                                                        <Columns>
                                                            <asp:TemplateField>
                                                                <ItemTemplate><strong><span style="color: #ff0000">Error :</span></strong></ItemTemplate>
                                                            </asp:TemplateField>
                                                        </Columns>
                                                    </asp:GridView>
                                                    <asp:GridView ID="grdKIUpload" runat="server" AutoGenerateColumns="False" CellPadding="1" CellSpacing="1" Width="100%">
                                                        <Columns>
                                                            <asp:TemplateField HeaderText="Key Indicators" SortExpression="KeyIndicator">
                                                                <EditItemTemplate>
                                                                    <asp:TextBox ID="TextBox63" runat="server" Text='<%# Bind("KeyIndicator") %>'></asp:TextBox>
                                                                </EditItemTemplate>
                                                                <ItemTemplate>
                                                                    <asp:Label ID="lblKeyIndicator" runat="server" Text='<%# Bind("KeyIndicator") %>'></asp:Label>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                          <%--  <asp:TemplateField HeaderText="Weightage" SortExpression="Weightage">
                                                                <EditItemTemplate>
                                                                    <asp:TextBox ID="TextBox64" runat="server" Text='<%# Bind("Weightage") %>'></asp:TextBox>
                                                                </EditItemTemplate>
                                                                <ItemTemplate>
                                                                    <asp:Label ID="lblWeightage" runat="server" Text='<%# Bind("Weightage") %>'></asp:Label>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>--%>
                                                         <%--   <asp:TemplateField HeaderText="Source Description" SortExpression="SourceDescription">
                                                                <EditItemTemplate>
                                                                    <asp:TextBox ID="TextBox1" runat="server" Text='<%# Bind("SourceDescription") %>'></asp:TextBox>
                                                                </EditItemTemplate>
                                                                <ItemTemplate>
                                                                    <asp:Label ID="lblSourceDescription" runat="server" Text='<%# Bind("SourceDescription") %>'></asp:Label>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>--%>
                                                        </Columns>
                                                    </asp:GridView>
                                                </asp:Panel>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" class="input_form_caption_td">
                                                <asp:Button ID="btnSaveKI" Height="30px" Width="100px" runat="server" OnClick="btnSaveKI_Click" Text="Submit" ValidationGroup="5" Visible="False" /><asp:Button ID="btnResetKi" Height="30px" Width="100px" runat="server" CausesValidation="False" OnClick="btnResetKi_Click" Text="Reset" />
                                                <asp:ValidationSummary ID="ValidationSummary3" runat="server" ShowMessageBox="True" ShowSummary="False" ValidationGroup="5" />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" class="input_form_caption_td">
                                                <asp:Label ID="lblerror" runat="server"></asp:Label>
                                            </td>
                                        </tr>
                                    </table>
                                    <table id="tblIndicator" class="table" style="display: none; width: 100%">
                                        <thead>
                                            <tr>
                                                <th>Id</th>
                                                <th>Description</th>
                                               
                                                <th>Deactive/Edit </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        </tbody>
                                    </table>

                                    <input type="hidden" id="hdnIndicatorId" value="0" />
                                    <input type="hidden" id="hdnIndicatorDesc" value="0" />
                                    <!-- Modal -->
                                    <div class="modal fade" id="IndicatorModal" tabindex="-1" role="dialog" aria-labelledby="IndicatorModalLabel" aria-hidden="true">
                                        <div class="modal-dialog" role="document">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="IndicatorModalLabel">Deactive Metric</h5>
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div class="modal-body">
                                                    <label>Enter Reason </label>
                                                    <input type="text" id="txtIndicatorReason" class="form-control" />
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-primary btn-sm" id="btnDeleteIndicator">Save changes</button>
                                                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="modal fade" id="RenameIndicatorModal" tabindex="-1" role="dialog" aria-labelledby="RenameIndicatorModalLabel" aria-hidden="true">
                                        <div class="modal-dialog" role="document">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="RenameIndicatorModalLabel">Edit description of Indicator</h5>
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div class="modal-body">
                                                    <div class="form-group">
                                                        <label>Rename Indicator Description</label>
                                                        <textarea class="form-control" rows="5" name="txtIndicator" id="txtIndicator"></textarea>

                                                    </div>
                                                 <%--   <div>
                                                        <label>Indicator Weighatge</label>
                                                        <br />
                                                        <input type="text" id="txtWeightageIndicator" name="txtWeightageIndicator" class="form-control" />
                                                    </div>--%>

                                                    <%--<input type="text" id="txtMetric"  />--%>
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-primary btn-sm" id="btnRenameIndicator">Save changes</button>
                                                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="modal fade" id="IndicatorModalActive" tabindex="-1" role="dialog" aria-labelledby="IndicatorModalLabelActive" aria-hidden="true">
                                        <div class="modal-dialog" role="document">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="IndicatorModalLabelActive">Active Metric</h5>
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div class="modal-body">
                                                    <label>Enter Reason </label>
                                                    <input type="text" id="txtIndicatorReasonActive" class="form-control" />
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-primary btn-sm" id="btnActiveIndicator">Save changes</button>
                                                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ContentTemplate>
                                <Triggers>
                                    <asp:PostBackTrigger ControlID="lnkExportKi" />
                                    <asp:PostBackTrigger ControlID="btnKeyUpload" />
                                </Triggers>
                            </asp:UpdatePanel>

                        </ContentTemplate>
                        <HeaderTemplate>
                            Key Indicator Master
                        
                        </HeaderTemplate>

                    </cc1:TabPanel>
                    <cc1:TabPanel ID="TabPanel3" runat="server" HeaderText="TabPanel3">
                        <HeaderTemplate>
                            Metric Master
                        
                        </HeaderTemplate>

                        <ContentTemplate>
                            <asp:UpdatePanel ID="UpdatePanel3" runat="server">

                                <ContentTemplate>
                                    <script type="text/javascript" src="js/jquery-2.1.3.min.js"></script>
                                    <script type="text/javascript" src="js/jquery-ui-1.12.1.min.js"></script>
                                    <script type="text/javascript" src="Repository/datatables/js/datatables.min.js"></script>
                                    <link href="css/jquery-ui-1.12.1.min.css" rel="stylesheet" />
                                    <link href="Repository/datatables/css/datatables.min.css" rel="stylesheet" />
                                    <link href="js1/sweetalert.css" rel="stylesheet" />
                                    <script src="js1/sweetalert.min.js"></script>
                                    <script type="text/javascript" src="Repository/bootstrap/js/select2.min.js"></script>
                                    <link href="Repository/bootstrap/css/select2.min.css" rel="stylesheet" />
                                    
                                    <script type="text/javascript">
                                         $(document).ready(function () {
                                              $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel3_ddlFinal').select2();
                                              $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel3_ddlEditFinal').select2();



                                         });
                                         Sys.Application.add_load(function () {
                                              $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel3_ddlFinal').select2();
                                              $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel3_ddlEditFinal').select2();
                                         });
                                         function setMetricId(Id) {
                                              $('#hdnMetricId').val(Id);
                                         }
                                         function setMetricIdandDesc(MeetingQuarter1, MeetingQuarter2, MeetingQuarter3, MeetingQuarter4, MId, desc, category, FinalMetric, SourceDivLevel, OtherDivLevel, SchoolLevel, MetricPriority, AllocationId, MetricFormula, IsExclusive, IsMandatory, UMSPath) {
                                              debugger;
                                              $('.rdisMand').prop('checked', false);
                                              if (IsMandatory == 'true')
                                                   $('#YisMandatory').prop("checked", true);
                                              else
                                                   $('#NisMandatory').prop("checked", true);

                                              $('#umsPath').val(UMSPath);

                                              $('#selectedDivision').text("");
                                              $('#selectedKeyIndicator').text("");
                                              $('#selectedDivisionId').text("");
                                              $("#ddlEditKI").empty();
                                              $("#ddlEditCriteria").empty();
                                              // Add the "Select" option
                                              $('#ddlEditKI').append('<option value="Select" id="Select">Select Key Indicator</option>');
                                              $('.chren').prop('checked', false);
                                              // alert(MetricWeightage);
                                              if (MeetingQuarter1 == "true") {
                                                   $('#chkren1').prop("checked", true);
                                              }
                                              else if (MeetingQuarter1 == "false") {
                                                   $('#chkren1').prop("checked", false);
                                              }

                                              if (MeetingQuarter2 == "true") {
                                                   $('#chkren2').prop("checked", true);
                                              }
                                              else if (MeetingQuarter2 == "false") {
                                                   $('#chkren2').prop("checked", false);
                                              }


                                              if (MeetingQuarter3 == "true") {
                                                   $('#chkren3').prop("checked", true);
                                              }
                                              else if (MeetingQuarter3 == "false") {
                                                   $('#chkren3').prop("checked", false);
                                              }

                                              if (MeetingQuarter4 == "true") {
                                                   $('#chkren4').prop("checked", true);
                                              }
                                              else if (MeetingQuarter4 == "false") {
                                                   $('#chkren4').prop("checked", false);
                                              }
                                              $('#hdnMetricId').val(MId);
                                              if (SourceDivLevel == 0)
                                                   SourceDivLevel = "Select";
                                              if (OtherDivLevel == 0)
                                                   OtherDivLevel = "Select";
                                              if (SchoolLevel == 0)
                                                   SchoolLevel = "Select";
                                              $("#txtMetricFormula").val(MetricFormula);
                                              $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel3_ddlSourceDivLevel1').val(SourceDivLevel);
                                              $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel3_ddlSchoolLevel1').val(SchoolLevel);
                                              $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel3_ddlDivisionLevel1').val(OtherDivLevel);
                                              //commented on 17 April 2023 to open allocation level request startblock
                                              //if (AllocationId != 0 && SourceDivLevel>0)
                                              //    $("#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel3_ddlSourceDivLevel1").prop("disabled", true);
                                              //else
                                              //    $("#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel3_ddlSourceDivLevel1").prop("disabled", false);
                                              //if (AllocationId != 0 && OtherDivLevel>0)
                                              //    $("#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel3_ddlDivisionLevel1").prop("disabled", true);
                                              //else
                                              //    $("#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel3_ddlDivisionLevel1").prop("disabled", false);
                                              //if (AllocationId != 0 && SchoolLevel>0)
                                              //    $("#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel3_ddlSchoolLevel1").prop("disabled", true);
                                              //else
                                              //    $("#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel3_ddlSchoolLevel1").prop("disabled", false);
                                              //commented on 17 April 2023 to open allocation level request endblock
                                              $('#txtMetric').val(desc);
                                              //$('#txtWeightage').val(MetricWeightage);
                                              $('.rd').prop('checked', false);


                                              $('#' + category).prop("checked", true);
                                              $('#' + MetricPriority).prop("checked", true);
                                              if (IsExclusive == 'true')
                                                   $('#YExclusive').prop("checked", true);
                                              else
                                                   $('#NExclusive').prop("checked", true);
                                              //  alert(FinalMetric);

                                              if (FinalMetric == "0") {
                                                   $('#dvFinal').show()
                                              }
                                              else
                                                   $('#dvFinal').hide()

                                              var divisionselect = $('#<%=ddlDivisionMetric.ClientID%>').find(":selected").text();
                                              if (divisionselect != "Select")
                                                   $('#selectedDivision').text(divisionselect);
                                              var divisionidselect = $('#<%=ddlDivisionMetric.ClientID%>').val();
                                              if (divisionidselect != "Select")
                                                   $('#selectedDivisionId').text(divisionidselect);
                                              var KIselect = $('#<%=ddlKiMetric.ClientID%>').find(":selected").text();
                                              $('#selectedKeyIndicator').text(KIselect);
                                              if ($('#selectedDivisionId').text() != "")
                                                   GetEditCriterias();

                                         }
                                         function GetMetrics() {
                                              //debugger;
                                              // alert('metric');
                                              if ($.fn.DataTable.isDataTable('#tblMetric')) {
                                                   $('#tblMetric').DataTable().destroy();
                                              }
                                              var Indicator = $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel3_ddlKiMetric').val();
                                              // alert(Indicator);
                                              if (Indicator != null && Indicator != 'Select') {
                                                   $.ajax({
                                                        type: "POST",
                                                        url: "frmCriteriaMaster.aspx/GetMetrics",
                                                        data: JSON.stringify({
                                                             IndicatorId: Indicator
                                                        }),
                                                        contentType: "application/json; charset=utf-8",
                                                        dataType: "json",
                                                        success: OnSuccess,
                                                        failure: function (response) {
                                                             alert(response.d);
                                                        },
                                                        error: function (response) {
                                                             alert(response.d);
                                                        },
                                                        complete: function () {
                                                             var MetricCount = $('#tblMetric>tbody>tr').length;
                                                             //alert(MetricCount);
                                                             $('#lblMetricCount').html('Total metrics in selected indicator are ' + MetricCount);
                                                        }

                                                   });
                                              }
                                         }

                                         function OnSuccess(response) {
                                              //debugger;
                                              $("#tblMetric").DataTable(
                                                   {
                                                        dom: 'Bfrtip',
                                                        bLengthChange: true,
                                                        lengthMenu: [[50, 100, -1], [50, 100, "All"]],
                                                        bFilter: true,
                                                        bSort: true,
                                                        bPaginate: true,
                                                        data: response.d,

                                                        columns: [{ "data": "Id" },
                                                        { "data": "MetricDesc" },
                                                        { "data": "Category" },
                                                        { "data": "MetricFinal" },

                                                        { "data": "SourceDivLevel" },
                                                        { "data": "OtherDivLevel" },
                                                        { "data": "SchoolLevel" },
                                                        { "data": "AllocationId" },
                                                        { "data": "MetricFormula" },
                                                        { "data": "MetricPriority" },
                                                        {
                                                             "data": "IsActive",
                                                             "render": function (data, type, row, meta) {
                                                                  if (type === 'display') {
                                                                       if (row.IsActive == true)
                                                                            data = '<a href="javascript:void(0)" class="btn btn-sm btn-warning" data-toggle="modal" onclick="setMetricId(' + "'" + row.Id + "'" + ')" data-target="#MetricModal"  data-backdrop="static" data-keyboard="false">Deactive</a> <a href="javascript:void(0)" class="btn btn-sm btn-info" data-toggle="modal" onclick="setMetricIdandDesc(' + "'" + row.MeetingQuarter1 + "'," + "'" + row.MeetingQuarter2 + "'," + "'" + row.MeetingQuarter3 + "'," + "'" + row.MeetingQuarter4 + "'," + "'" + row.Id + "'," + "'" + row.MetricDesc.replace(/\s{2,}/g, ' ').trim().replace(/\r/g, "").replace(/\n/g, "").replace(/'/g, "") + "'," + "'" + row.Category + "'," + "'" + row.MetricFinal + "'," + "'" + row.SourceDivLevel + "'," + "'" + row.OtherDivLevel + "'," + "'" + row.SchoolLevel + "'," + "'" + row.MetricPriority + "'," + "'" + row.AllocationId + "'," + "'" + row.MetricFormula.replace(/\s{2,}/g, ' ').trim().replace(/\r/g, "").replace(/\n/g, "").replace(/'/g, "") + "'" + "," + "'" + row.IsExclusive + "'" + "," + "'" + row.isMandatoryN + "'" + "," + "'" + row.UMSPath + "'" + ')" data-target="#RenameMetricModal"  data-backdrop="static" data-keyboard="false">Edit</a>'
                                                                       else
                                                                            data = '<a href="javascript:void(0)" class="btn btn-sm btn-danger" data-toggle="modal" onclick="setMetricId(' + "'" + row.Id + "'" + ')" data-target="#MetricModalActive"  data-backdrop="static" data-keyboard="false">Active</a> '

                                                                  }



                                                                  return data;
                                                             }
                                                        }

                                                        ],
                                                        columnDefs: [
                                                             { width: 30, targets: 2 },
                                                             { width: 150, targets: 10 },
                                                             { visible: false, targets: 3 },
                                                             { visible: false, targets: 4 },
                                                             { visible: false, targets: 5 },
                                                             { visible: false, targets: 6 },
                                                             { visible: false, targets: 7 },
                                                        ],

                                                        buttons: [{
                                                             extend: 'excel',
                                                             text: 'Export to Excel',
                                                             className: 'btn btn-warning',
                                                             filename: 'Metriclist',
                                                             exportOptions: { columns: [0, 1], modifier: { page: 'all' /*'current'*/ } }

                                                        }]
                                                   }).columns.adjust();

                                         };
                                         function bindeditKeyIndicator() {


                                              // alert('indicator');
                                              //  //debugger;

                                              var selectedCrieriaId = $('#ddlEditCriteria').val();
                                              // alert(selectedCrieriaId);
                                              if (selectedCrieriaId != 'Select') {
                                                   $.ajax({
                                                        type: "POST",
                                                        url: "frmCriteriaMaster.aspx/GetIndicators",
                                                        data: JSON.stringify({
                                                             CriteriaId: selectedCrieriaId
                                                        }),
                                                        contentType: "application/json; charset=utf-8",
                                                        dataType: "json",
                                                        success: function (data) {
                                                             if (data.d.length > 0 && data.d[0].Id === -1) {
                                                                  //error
                                                                  console.error(data.d[0].ErrorMessage);
                                                                  alert("An error has occured while fetching form initializtion details. Please try later.");
                                                             }
                                                             else {
                                                                  lstdata = [];
                                                                  var options = "";
                                                                  options = "<option id='Select' value='Select' >Select Key Indicator</option>";
                                                                  $.each(data.d, function (index, item) {
                                                                       if (item.ISActive) {
                                                                            options = options + "<option value='" + item.Id + "' id='" + item.Id + "'>" + item.IndicatorDesc + "</option>";
                                                                            lstdata.push({ id: item.Id, text: item.IndicatorDesc });
                                                                       }
                                                                  });

                                                                  $("#ddlEditKI").html(options);

                                                             }
                                                        },
                                                        failure: function (response) {
                                                             alert(response.d);
                                                             //alert('fail');
                                                        },
                                                        error: function (response) {
                                                             alert(response.d);
                                                             //alert('error');
                                                        }


                                                   });
                                              }

                                         }
                                         function GetEditCriterias() {
                                              // alert('indicator');
                                              //  //debugger;

                                              var selectedDivisionid = $('#selectedDivisionId').text();
                                              // alert(Division);
                                              if (selectedDivisionid != null && selectedDivisionid != '') {
                                                   $.ajax({
                                                        type: "POST",
                                                        url: "frmCriteriaMaster.aspx/GetCriterias",
                                                        data: JSON.stringify({
                                                             divId: selectedDivisionid
                                                        }),
                                                        contentType: "application/json; charset=utf-8",
                                                        dataType: "json",
                                                        success: function (data) {
                                                             if (data.d.length > 0 && data.d[0].Id === -1) {
                                                                  //error
                                                                  console.error(data.d[0].ErrorMessage);
                                                                  alert("An error has occured while fetching form initializtion details. Please try later.");
                                                             }
                                                             else {
                                                                  lstdata = [];
                                                                  var options = "";
                                                                  options = "<option id='Select'>Select Criteria</option>";
                                                                  $.each(data.d, function (index, item) {
                                                                       if (item.ISActive) {
                                                                            options = options + "<option value='" + item.Id + "' id='" + item.Id + "'>" + item.CriteriaDesc + "</option>";
                                                                            lstdata.push({ id: item.Id, text: item.CriteriaDesc });
                                                                       }
                                                                  });

                                                                  $("#ddlEditCriteria").html(options);

                                                           <%-- var CriteriaSelect = $('#<%=ddlCriteriaMetric.ClientID%>').find(":selected").text();

                                                            $('#ddlEditCriteria').val(CriteriaSelect);
                                                            $('#ddlEditCriteria').trigger('change');--%>
                                                          }
                                                     },
                                                     failure: function (response) {
                                                          alert(response.d);
                                                          //alert('fail');
                                                     },
                                                     error: function (response) {
                                                          alert(response.d);
                                                          //alert('error');
                                                     }


                                                });
                                              }
                                         }



                                         function Metrics() {
                                              $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel3_ddlKiMetric').change(function (e) {
                                                   // alert('infn');
                                                   e.preventDefault();
                                                   GetMetrics();

                                                   $('#tblMetric').show();

                                              })
                                         }
                                         function RenameMetric() {
                                              debugger;
                                              $('#btnRename').click(function (e) {

                                                   var value = $("input[type=radio][name=MetricCategory]:checked").val();
                                                   var Priority = $("input[type=radio][name=MetricPriority]:checked").val();
                                                   var isExclusive = $("input[type=radio][name=IsExclusive]:checked").val();

                                                   var keyindicatorid = $('#ddlEditKI').val();
                                                   // alert(isExclusive);
                                                   e.preventDefault();
                                                   if (value != undefined) {
                                                        swal({
                                                             title: "Confirm Rename",
                                                             text: "Are you sure to rename or change category of this metric",
                                                             closeOnConfirm: true,
                                                             closeOnCancel: true,
                                                             showCancelButton: true,
                                                             confirmButtonText: "Yes",
                                                             cancelButtonText: "No"

                                                        },
                                                             function (isConfirm) {
                                                                  if (isConfirm) {
                                                                       var Desc = $('#txtMetric').val();
                                                                       //var Weightage = $('#txtWeightage').val();
                                                                       var MetricId = $('#hdnMetricId').val();
                                                                       var Category = value;
                                                                       var FinalId = 0;
                                                                       var IndicatorId = $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel3_ddlKiMetric').val();
                                                                       var Source = $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel3_ddlSourceDivLevel1').val();
                                                                       var Other = $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel3_ddlDivisionLevel1').val();
                                                                       var School = $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel3_ddlSchoolLevel1').val();
                                                                       var MetricFormula = $('#txtMetricFormula').val();
                                                                       var isMandatory = $("input[type=radio][name=isMandatoryN]:checked").val();
                                                                       var umsPath = $('#umsPath').val();
                                                                       // alert(isMandatory + ' sdfsd' + umsPath);
                                                                       if (Source == 'Select')
                                                                            Source = 0
                                                                       if (Other == 'Select')
                                                                            Other = 0
                                                                       if (School == 'Select')
                                                                            School = 0
                                                                       if ($("#dvFinal").is(":visible")) {
                                                                            FinalId = $("#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel3_ddlEditFinal").val();
                                                                            //alert
                                                                       }
                                                                       if (FinalId == 'Select')
                                                                            FinalId = 0

                                                                       var meetingQuarters1 = $('#chkren1').is(':checked');
                                                                       var meetingQuarters2 = $('#chkren2').is(':checked');
                                                                       var meetingQuarters3 = $('#chkren3').is(':checked');
                                                                       var meetingQuarters4 = $('#chkren4').is(':checked');
                                                                       debugger;
                                                                       if (Desc != "") {
                                                                            $.ajax({
                                                                                 type: "POST",
                                                                                 url: "frmCriteriaMaster.aspx/RenameMetrics",
                                                                                 contentType: "application/json; charset=utf-8",
                                                                                 dataType: "json",
                                                                                 data: JSON.stringify({
                                                                                      MetricId: MetricId, Desc: Desc, Category: Category, FinalSourceDivId: FinalId, IndicatorId: IndicatorId, SourceDiv: Source, OtherDiv: Other, School: School, MetricFormula: MetricFormula, MetricPriority: Priority
                                                                                      , MeetingQuarter1: meetingQuarters1, MeetingQuarter2: meetingQuarters2,
                                                                                      MeetingQuarter3: meetingQuarters3, MeetingQuarter4: meetingQuarters4, IsExclusive: isExclusive == 1 ? true : false, newkeyindicatorId: keyindicatorid == "Select" ? "0" : keyindicatorid, IsMandatory: isMandatory == 1 ? true : false, UmsPath: umsPath
                                                                                 }),
                                                                                 success: function (data) {
                                                                                      //debugger;
                                                                                      var msg = data.d;
                                                                                      if (msg == "Update successfuly") {
                                                                                           setTimeout(function () {
                                                                                                swal({ title: "", text: msg, type: "success" },
                                                                                                     function () {
                                                                                                          GetMetrics();

                                                                                                     })
                                                                                           }, 1000)
                                                                                      }
                                                                                      else
                                                                                           alert(msg);

                                                                                 },
                                                                                 failure: function (response) {
                                                                                      alert(response.d);
                                                                                 },
                                                                                 error: function (response) {
                                                                                      alert(response.d);
                                                                                 }
                                                                            })
                                                                       }
                                                                       else {
                                                                            alert('Enter value in description');
                                                                       }

                                                                  }
                                                             });
                                                   }
                                                   else
                                                        alert("Please select metric category");

                                              })
                                         }
                                         function DeleteMetric() {
                                              $('#btnDelete').click(function (e) {
                                                   e.preventDefault();
                                                   swal({
                                                        title: "Confirm Delete",
                                                        text: "Are you sure to delete this metric",
                                                        closeOnConfirm: true,
                                                        closeOnCancel: true,
                                                        showCancelButton: true,
                                                        confirmButtonText: "Yes",
                                                        cancelButtonText: "No"

                                                   },
                                                        function (isConfirm) {
                                                             if (isConfirm) {
                                                                  var Reason = $('#txtReason').val();
                                                                  var MetricId = $('#hdnMetricId').val();
                                                                  if (Reason != "") {
                                                                       $.ajax({
                                                                            type: "POST",
                                                                            url: "frmCriteriaMaster.aspx/DeleteMetrics",
                                                                            contentType: "application/json; charset=utf-8",
                                                                            dataType: "json",
                                                                            data: JSON.stringify({
                                                                                 MetricId: MetricId, Reason: Reason, IsActive: 0
                                                                            }),
                                                                            success: function (data) {
                                                                                 //debugger;
                                                                                 var msg = data.d;
                                                                                 if (msg == "Deactive successfuly") {
                                                                                      setTimeout(function () {
                                                                                           swal({ title: "", text: msg, type: "success" },
                                                                                                function () {
                                                                                                     GetMetrics();

                                                                                                })
                                                                                      }, 1000)
                                                                                 }
                                                                                 else
                                                                                      alert(msg);

                                                                            },
                                                                            failure: function (response) {
                                                                                 alert(response.d);
                                                                            },
                                                                            error: function (response) {
                                                                                 alert(response.d);
                                                                            }
                                                                       })
                                                                  }
                                                                  else {
                                                                       alert('Enter Reason');
                                                                  }

                                                             }
                                                        });
                                              })
                                         }
                                         function ActiveIndicator() {
                                              $('#btnActiveIndicator').click(function (e) {
                                                   e.preventDefault();
                                                   swal({
                                                        title: "Confirm Active",
                                                        text: "Are you sure to active this indicator",
                                                        closeOnConfirm: true,
                                                        closeOnCancel: true,
                                                        showCancelButton: true,
                                                        confirmButtonText: "Yes",
                                                        cancelButtonText: "No"

                                                   },
                                                        function (isConfirm) {
                                                             if (isConfirm) {
                                                                  var Reason = $('#txtIndicatorReasonActive').val();
                                                                  var IndicatorId = $('#hdnIndicatorId').val();
                                                                  if (Reason != "") {
                                                                       $.ajax({
                                                                            type: "POST",
                                                                            url: "frmCriteriaMaster.aspx/DeleteKeyIndicator",
                                                                            contentType: "application/json; charset=utf-8",
                                                                            dataType: "json",
                                                                            data: JSON.stringify({
                                                                                 IndicatorId: IndicatorId, Reason: Reason, IsActive: 1
                                                                            }),
                                                                            success: function (data) {
                                                                                 //debugger;
                                                                                 var msg = data.d;
                                                                                 if (msg == "Active successfuly") {
                                                                                      setTimeout(function () {
                                                                                           swal({ title: "", text: msg, type: "success" },
                                                                                                function () {
                                                                                                     GetIndicators();

                                                                                                })
                                                                                      }, 1000)
                                                                                 }
                                                                                 else
                                                                                      alert(msg);

                                                                            },
                                                                            failure: function (response) {
                                                                                 alert(response.d);
                                                                            },
                                                                            error: function (response) {
                                                                                 alert(response.d);
                                                                            }
                                                                       })
                                                                  }
                                                                  else {
                                                                       alert('Enter Reason');
                                                                  }

                                                             }
                                                        });
                                              })
                                         }
                                         function ShowMetric() {
                                              GetMetrics();
                                              //var count = $('#tblMetric tr').length;
                                              //alert(count);
                                              //if (count > 1) {
                                              $('#tblMetric').show();
                                              //}

                                         }

                                         function ActiveMetric() {
                                              $('#btnActiveMetric').click(function (e) {
                                                   e.preventDefault();
                                                   swal({
                                                        title: "Confirm Active",
                                                        text: "Are you sure to active this metric",
                                                        closeOnConfirm: true,
                                                        closeOnCancel: true,
                                                        showCancelButton: true,
                                                        confirmButtonText: "Yes",
                                                        cancelButtonText: "No"

                                                   },
                                                        function (isConfirm) {
                                                             if (isConfirm) {
                                                                  var Reason = $('#txtMetricReasonActive').val();
                                                                  var MetricId = $('#hdnMetricId').val();
                                                                  if (Reason != "") {
                                                                       $.ajax({
                                                                            type: "POST",
                                                                            url: "frmCriteriaMaster.aspx/DeleteMetrics",
                                                                            contentType: "application/json; charset=utf-8",
                                                                            dataType: "json",
                                                                            data: JSON.stringify({
                                                                                 MetricId: MetricId, Reason: Reason, IsActive: 1
                                                                            }),
                                                                            success: function (data) {
                                                                                 //debugger;
                                                                                 var msg = data.d;
                                                                                 if (msg == "Active successfuly") {
                                                                                      setTimeout(function () {
                                                                                           swal({ title: "", text: msg, type: "success" },
                                                                                                function () {
                                                                                                     GetMetrics();

                                                                                                })
                                                                                      }, 1000)
                                                                                 }
                                                                                 else
                                                                                      alert(msg);

                                                                            },
                                                                            failure: function (response) {
                                                                                 alert(response.d);
                                                                            },
                                                                            error: function (response) {
                                                                                 alert(response.d);
                                                                            }
                                                                       })
                                                                  }
                                                                  else {
                                                                       alert('Enter Reason');
                                                                  }

                                                             }
                                                        });
                                              })
                                         }


                                         function searchmetrics(metricname) {
                                              //alert(metricname.length);
                                              var searchTerm = document.getElementById('ctl00_ContentPlaceHolder1_TabContainer1_TabPanel3_txtMeric').value.toLowerCase();
                                              //alert(searchTerm);
                                              if (searchTerm.length >= 3) {
                                                   $.ajax({
                                                        type: "POST",
                                                        url: "frmCriteriaMaster.aspx/SearchMetrics",
                                                        data: JSON.stringify({
                                                             MetricName: searchTerm
                                                        }),
                                                        contentType: "application/json; charset=utf-8",
                                                        dataType: "json",
                                                        success: OnSuccessMetricSearch,
                                                        failure: function (response) {
                                                             alert(response.d);
                                                        },
                                                        error: function (response) {
                                                             alert(response.d);
                                                        },
                                                        complete: function () {
                                                        }

                                                   });
                                              }
                                              else {
                                                   var ul = $("#myList");

                                                   // Clear the list (optional)
                                                   ul.empty();

                                                   $('#MetricDescriptionShow').hide();
                                              }


                                         }

                                         function OnSuccessMetricSearch(response) {
                                              var searchTerm = document.getElementById('ctl00_ContentPlaceHolder1_TabContainer1_TabPanel3_txtMeric').value.toLowerCase();

                                              //alert(JSON.stringify(response));
                                              var ul = $("#myList");

                                              // Clear the list (optional)
                                              ul.empty();

                                              // Generate dynamic <li> elements
                                              $.each(response.d, function (index, item) {
                                                   // Create a new <li> element
                                                   var li = $("<li></li>");
                                                   var text = item.MetricDescription;
                                                   // Set the text content of the <li> element
                                                   //li.text(item.MetricDescription);

                                                   var regex = new RegExp('(' + searchTerm + ')', 'gi');

                                                   // Highlight the matched search text
                                                   text = text.replace(regex, '<span class="highlight">$1</span>');


                                                   // Append the index number alongside the item
                                                   li.html((index + 1) + ". " + text);
                                                   // Append the <li> element to the <ul> parent
                                                   ul.append(li);
                                              });

                                              if (response.d.length > 0)
                                                   $('#MetricDescriptionShow').show();
                                              else
                                                   $('#MetricDescriptionShow').hide();
                                        }

                                        //13_02_2025

                                        function onClientSelectedIndexChanged(sender, args) {
                                            var selectedItems = sender.get_checkedItems();
                                            var selectedValues = [];

                                            for (var i = 0; i < selectedItems.length; i++) {
                                                selectedValues.push(selectedItems[i].get_value());
                                            }

                                            // Display selected values
                                            document.getElementById('<%= lblSelectedValues.ClientID %>').innerText = "Selected Values: " + selectedValues.join(", ");
                                         }
                                    </script>
                                    <script type="text/javascript" language="javascript">
                                         Sys.Application.add_load(Metrics);
                                         Sys.Application.add_load(setMetricId);
                                         Sys.Application.add_load(setMetricIdandDesc);
                                         Sys.Application.add_load(DeleteMetric);
                                         Sys.Application.add_load(RenameMetric);
                                         Sys.Application.add_load(ShowMetric);
                                         Sys.Application.add_load(ActiveMetric);
                                         // Sys.Application.add_load(MultipleSelection);
                                         //Sys.Application.add_load(UnselectSelection);
                                         //Sys.Application.add_load(ValidData);
                                    </script>
                                  <%-- <script>
                                       document.addEventListener("DOMContentLoaded", function () {
                                           var dropdownButton = document.getElementById("dropdownButton");
                                           var dropdownList = document.getElementById("dropdownList");

                                           if (dropdownButton) {
                                               dropdownButton.addEventListener("click", function (event) {
                                                   event.stopPropagation(); // Prevent closing immediately
                                                   if (dropdownList.style.display === "none" || dropdownList.style.display === "") {
                                                       dropdownList.style.display = "block";
                                                   } else {
                                                       dropdownList.style.display = "none";
                                                   }
                                               });
                                           }

                                           // Close dropdown when clicking outside
                                           document.addEventListener("click", function (event) {
                                               if (!dropdownButton.contains(event.target) && !dropdownList.contains(event.target)) {
                                                   dropdownList.style.display = "none";
                                               }
                                           });
                                       });

                                       function updateSelectedDivisions() {
                                           let selectedValues = [];
                                           document.querySelectorAll(".chkBox:checked").forEach(checkbox => {
                                               selectedValues.push(checkbox.value);
                                           });

                                           // Store selected values in a hidden field
                                           document.getElementById('<%= hfSelectedValues.ClientID %>').value = selectedValues.join(',');

                                            // Update label with selected values
                                            document.getElementById('<%= lblverifications.ClientID %>').innerText = "Selected: " + selectedValues.join(', ');
                                        }                         
                                    </script>--%>
                                    <table align="center" bgcolor="#cccccc" border="0" cellpadding="1" cellspacing="1" width="100%">
                                        <tr>
                                            <td align="right" class="input_form_caption_td"  colspan="2">
                                                <asp:LinkButton ID="lnkExportMetric" runat="server" OnClick="lnkExportMetric_Click" Visible="False">Download Data</asp:LinkButton>
                                                &nbsp;<asp:LinkButton ID="lnkExportMetricDyn" runat="server" style="color: red;" OnClick="lnkExportMetricDyn_Click" >Download Format</asp:LinkButton>
                                           
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="input_form_caption_td" colspan="2">
                                                <table align="center" bgcolor="#cccccc" border="0" cellpadding="1" cellspacing="1" style="width: 70%;">
                                                    <%-- <tr>
                                                        <td class="input_form_caption_td" style="width: 20%;">
                                                            <asp:Label ID="Label2420" runat="server" Text="Session :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlSessionMetric" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlSessionMetric_SelectedIndexChanged1" OnDataBound="ddlSessionMetric_DataBound" Width="250px"></asp:DropDownList><asp:RequiredFieldValidator ID="RequiredFieldValidator11" runat="server" ControlToValidate="ddlSessionMetric" ErrorMessage="Please select session" InitialValue="0" ValidationGroup="metric">*</asp:RequiredFieldValidator></td>
                                                    </tr>--%>
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label2421" runat="server" Text="Division :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlDivisionMetric" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlDivisionMetric_SelectedIndexChanged" OnDataBound="ddlDivisionMetric_DataBound" Width="350px"></asp:DropDownList><asp:RequiredFieldValidator ID="RequiredFieldValidator12" runat="server" ControlToValidate="ddlDivisionMetric" ErrorMessage="Please select division" InitialValue="0" ValidationGroup="metric">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label2422" runat="server" Text="Criteria :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlCriteriaMetric" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlCriteriaMetric_SelectedIndexChanged" OnDataBound="ddlCriteriaMetric_DataBound" Width="350px"></asp:DropDownList><asp:RequiredFieldValidator ID="RequiredFieldValidator13" runat="server" ControlToValidate="ddlCriteriaMetric" ErrorMessage="Please select criteria" InitialValue="0" ValidationGroup="metric">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label2427" runat="server" Text="Key Indicator :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlKiMetric" runat="server" OnDataBound="ddlKiMetric_DataBound" Width="350px"></asp:DropDownList><asp:RequiredFieldValidator ID="RequiredFieldValidator17" runat="server" ControlToValidate="ddlKiMetric" ErrorMessage="Please select key indicator" InitialValue="0" ValidationGroup="metric">*</asp:RequiredFieldValidator>
                                                            <button id="btnShowMetric" class="aspButton btn-primary" style="display: none">Show Metrics</button>
                                                            <%--       <asp:Label ID="lblMetricCount" runat="server"></asp:Label>--%>
                                                            <label id="lblMetricCount"></label>
                                                        </td>

                                                    </tr>
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label2423" runat="server" Text="Upload Category :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:RadioButtonList ID="rblMetricOptions" runat="server" AutoPostBack="True" OnSelectedIndexChanged="rblMetricOptions_SelectedIndexChanged" RepeatDirection="Horizontal" RepeatLayout="Flow">
                                                                <asp:ListItem Value="S">Single Entry</asp:ListItem>
                                                                <asp:ListItem Value="M" >Multiple Entries</asp:ListItem>
                                                            </asp:RadioButtonList><asp:RequiredFieldValidator ID="RequiredFieldValidator14" runat="server" ControlToValidate="rblMetricOptions" ErrorMessage="Please select upload category" ValidationGroup="metric">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr id="MetricSingle1" runat="server" visible="False">
                                                        <td runat="server" class="input_form_caption_td">
                                                            <asp:Label ID="Label2424" runat="server" Text="Metric  description :"></asp:Label></td>
                                                        <td runat="server" class="input_form_caption_td">
                                                            <asp:TextBox ID="txtMeric"  onkeyup="searchmetrics(this.value);"  runat="server"  TextMode="MultiLine" Width="350px"></asp:TextBox><asp:RequiredFieldValidator ID="RequiredFieldValidator15" ForeColor="Red" runat="server" ControlToValidate="txtMeric" ErrorMessage="Please enter Metric" ValidationGroup="metric">*</asp:RequiredFieldValidator>
                                                           <%-- <asp:RegularExpressionValidator ID="RegularExpressionValidator3" runat="server"         --Commented as on 13/02/2025 
                                                                ValidationExpression="^[ A-Za-z0-9-&()+:.%/,]*$"
                                                                ControlToValidate="txtMeric" ForeColor="Red"  ErrorMessage="Special characters are not allowed except +-()&:.%/" ValidationGroup="metric"></asp:RegularExpressionValidator>--%>
                                                            <br /><div id="MetricDescriptionShow" style="display:none;overflow-y:scroll;max-height:300px;" >
                                                                <ol id="myList"></ol>
                                                            </div>
                                                        </td>

                                                    </tr>
                                                    <tr id="MetricSingle2" runat="server" visible="False">
                                                        <td runat="server" class="input_form_caption_td">
                                                            <asp:Label ID="Label2" runat="server" Text="Formula :"></asp:Label></td>
                                                        <td runat="server" class="input_form_caption_td">
                                                            <asp:TextBox ID="txtFormula" runat="server" TextMode="MultiLine" Width="250px"></asp:TextBox><asp:RequiredFieldValidator ID="RequiredFieldValidator2" runat="server" ControlToValidate="txtFormula" ErrorMessage="Please enter formula"  ForeColor="Red"  ValidationGroup="metric">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                             
                                                    <tr id="MetricSingle4" runat="server" visible="False">
                                                        <td runat="server" class="input_form_caption_td">
                                                            <asp:Label ID="Label3" runat="server" Text="Has stages :"></asp:Label></td>
                                                        <td runat="server" class="input_form_caption_td">
                                                            <asp:RadioButtonList ID="rblHasStages" runat="server" RepeatDirection="Horizontal" RepeatLayout="Flow">
                                                                <asp:ListItem Selected="True" Value="M">Yes</asp:ListItem>
                                                                <asp:ListItem Value="P">No</asp:ListItem>
                                                            </asp:RadioButtonList>
                                                            <asp:RequiredFieldValidator ID="RequiredFieldValidator9" runat="server" ControlToValidate="rblHasStages" ErrorMessage="Has Stages is required." ValidationGroup="metric" InitialValue="0">*</asp:RequiredFieldValidator></td>
                                                    </tr>

                                                     <tr id="MetricSingleExclusive" runat="server" visible="False">
                                                        <td runat="server" class="input_form_caption_td">
                                                            <asp:Label ID="lblMarkExclusive" runat="server" Text="Mark As Exclusive? :"></asp:Label></td>
                                                        <td runat="server" class="input_form_caption_td">
                                                            <asp:RadioButtonList ID="rbtnMarkExclusive" runat="server" RepeatDirection="Horizontal" RepeatLayout="Flow">
                                                                <asp:ListItem Value="1">Yes</asp:ListItem>
                                                                <asp:ListItem  Selected="True" Value="0">No</asp:ListItem>
                                                            </asp:RadioButtonList>
                                                            <asp:RequiredFieldValidator ID="rFVrbtnMarkExclusive" runat="server" ControlToValidate="rbtnMarkExclusive" ErrorMessage="Please Select Mark As Exclusive" ValidationGroup="metric" >*</asp:RequiredFieldValidator></td>
                                                    </tr>


                                                    <tr id="MetricCategory" runat="server" visible="False">
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label12" runat="server" Text="Metric Category :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:RadioButtonList ID="rdlMetricCategory" runat="server" RepeatDirection="Horizontal">
                                                                <asp:ListItem Selected="True" Value="A">Part-A only</asp:ListItem>
                                                                <asp:ListItem Value="B">Part-B only</asp:ListItem>
                                                                <asp:ListItem Value="AB">Part-A & B</asp:ListItem>
                                                                <asp:ListItem Value="C">Part-C only</asp:ListItem>
                                                            </asp:RadioButtonList></td>
                                                    </tr>
                                                    <tr  id="MetricPriority" runat="server" style="background-color: #fff;" >
                                                        <td class="input_form_caption_td"> 
                                                            <asp:Label ID="Label30" runat="server" Text="Metric Priority :"></asp:Label>
                                                        </td>
                                                        <td class="input_form_caption_td" style="display: inline-block;">
                                                            <asp:RadioButtonList ID="rdlMetricPriority" runat="server" RepeatDirection="Horizontal">
                                                                <asp:ListItem Selected="True" Value="L">Low</asp:ListItem>
                                                                <asp:ListItem Value="M">Medium</asp:ListItem>
                                                                <asp:ListItem Value="H">High</asp:ListItem>
                                                            </asp:RadioButtonList>
                                                        </td>
                                                    </tr>
                                                     <tr  id="QuarterWiseMetricDiscussion" runat="server" visible="false"  >
                                                        <td class="input_form_caption_td"> 
                                                            <asp:Label ID="lblMetricDiscussion" runat="server" Text="Metric Discussion Quarter(s) :"></asp:Label>
                                                        </td>
                                                        <td class="input_form_caption_td" style="display: inline-block;">
                                                            <asp:CheckBoxList ID="chkLstMetricDiscussion" runat="server" RepeatDirection="Horizontal">
                                                                <asp:ListItem Value="1">Quarter 1</asp:ListItem>
                                                                <asp:ListItem Value="2">Quarter 2</asp:ListItem>
                                                                <asp:ListItem Value="3">Quarter 3</asp:ListItem>                                                                
                                                                <asp:ListItem Value="4">Quarter 4</asp:ListItem>
                                                            </asp:CheckBoxList>
                                                            
                                                            </td>
                                                    </tr>
                                                    <tr id="MetricFinalDivision" runat="server" visible="False">
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label13" runat="server" Text="Final Division for Verification :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlFinal" runat="server" Width="250px"></asp:DropDownList>
                                                           <%-- <asp:RequiredFieldValidator ID="RequiredFieldValidator4" runat="server" ControlToValidate="ddlFinal" ErrorMessage="Please select final division for verification " ValidationGroup="metric" InitialValue="Select">*</asp:RequiredFieldValidator>--%>
                                                        </td>
                                                    </tr>

                                                    <tr id="MetricSourceLevel" runat="server" visible="False">
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label15" runat="server" Text="Source Division Allocation upto Level :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlSourceDivLevel" runat="server" Width="250px" ></asp:DropDownList>
                                                           
                                                        </td>
                                                    </tr>

                                                    <tr id="MetricSchoolLevel" runat="server" visible="False">
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label16" runat="server" Text="School Allocation upto Level :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlSchoolLevel" runat="server" Width="250px" ></asp:DropDownList>
                                                        </td>
                                                    </tr>

                                                     <tr id="MetricDivLevel" runat="server" visible="False" >
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label17" runat="server" Text="Other Division Allocation upto Level :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                           
                                                   <asp:DropDownList ID="ddlDivisionLevel" runat="server" Width="250px"></asp:DropDownList>
                                                           
                                                        </td>
                                                    </tr>
                                                     <tr id="MetricOldReferenceMetricId" runat="server" visible="False">
                                                          <td runat="server" class="input_form_caption_td">
                                                               <asp:Label ID="lblOldMetricReferenceId" runat="server" Text="Old Reference Metric Id:"></asp:Label></td>
                                                          <td runat="server" class="input_form_caption_td">
                                                               <asp:TextBox ID="txtOldMetricReferenceId" Style="width: 250px;" runat="server"></asp:TextBox>
                                                               <%--<asp:RequiredFieldValidator ID="RequiredFieldValidator26" ForeColor="Red" runat="server" ControlToValidate="txtOldMetricReferenceId" ErrorMessage="Please enter Old Metric Id Reference" ValidationGroup="metric">*</asp:RequiredFieldValidator>--%>
                                                               <asp:RegularExpressionValidator ID="RegularExpressionValidator1" runat="server" ValidationExpression="^[ 0-9]*$" ControlToValidate="txtOldMetricReferenceId" ForeColor="Red" ErrorMessage="Special characters are not allowed" ValidationGroup="metric"></asp:RegularExpressionValidator>

                                                               </div>
                                                          </td>

                                                     </tr>

                                                     <tr id="Tr33" runat="server">
                                                          <td class="input_form_caption_td">
                                                               <asp:Label ID="Label31" runat="server" Text="Is Manidtary Point :"></asp:Label>
                                                          </td>

                                                          <td runat="server" align="left">
                                                               <asp:RadioButtonList ID="IsMandatory" runat="server" RepeatDirection="Horizontal">
                                                                    <asp:ListItem Text="Yes" Value="1"></asp:ListItem>
                                                                    <asp:ListItem Text="No" Value="0" Selected="True"></asp:ListItem>
                                                               </asp:RadioButtonList>
                                                          </td>
                                                     </tr>

                                                     <tr  id="Tr34" runat="server">
                                                          <td runat="server" class="input_form_caption_td">
                                                               <asp:Label ID="Label32" runat="server" Text="UMS Path:"></asp:Label></td>
                                                          <td runat="server" class="input_form_caption_td">
                                                               <asp:TextBox ID="txtUmsPath" Style="width: 250px;" runat="server"></asp:TextBox>    
                                                               </div>
                                                          </td>

                                                     </tr>
                                                     <tr id="trAccredobs" runat="server" visible="false">
                                                         <td class="input_form_caption_td" style="width: 20%;">
                                                               <asp:Label ID="Label33" runat="server" Text="Verification Divisions : "></asp:Label>
                                                         </td>
                                                         <td class="input_form_caption_td">
                                                            <telerik:RadComboBox ID="RadComboBox1" runat="server" CheckBoxes="True" 
                                                                AutoPostBack="true" 
                                                                OnSelectedIndexChanged="RadComboBox1_SelectedIndexChanged"
                                                                OnClientSelectedIndexChanged="onClientSelectedIndexChanged"
                                                                DropDownHeight="200px" DropDownWidth="300px" MultiColumn="True">
                                                            </telerik:RadComboBox>

                                                            <asp:Label ID="lblSelectedValues" runat="server" Text="Selected Values: " />
                                                         </td>
                                                   </tr>


                                                    <tr id="MetricMultiple" runat="server" visible="False">
                                                        <td runat="server" class="input_form_caption_td">
                                                            <asp:Label ID="Label2426" runat="server" Text="Upload File :"></asp:Label></td>
                                                        <td runat="server" class="input_form_caption_td">
                                                            <asp:FileUpload ID="fuMetricUpload" runat="server" Width="250px" />
                                                            <asp:Button ID="btnMetricUpload" Height="30px" Width="100px" runat="server" OnClick="btnMetricUpload_Click" Text="Upload" />
                                                        </td>
                                                    </tr>
                                                </table>

                                            </td>
                                        </tr>
                                        <tr id="TRMetricOfflinePnl" runat="server" visible="False">
                                            <td runat="server" align="center" class="input_form_caption_td">
                                                <asp:Panel ID="Panel4" runat="server" Height="200px" ScrollBars="Both">
                                                    <asp:GridView ID="grdError3" runat="server" ShowHeader="False">
                                                        <Columns>
                                                            <asp:TemplateField>
                                                                <ItemTemplate><strong><span style="color: #ff0000">Error :</span></strong></ItemTemplate>
                                                            </asp:TemplateField>
                                                        </Columns>
                                                    </asp:GridView>
                                                    <asp:GridView ID="grdMetricUpload" runat="server" AutoGenerateColumns="False" CellPadding="1" CellSpacing="1" Width="100%">
                                                        <Columns>
                                                            <asp:TemplateField HeaderText="Metric Description" SortExpression="MetricDescription">
                                                                <EditItemTemplate>
                                                                    <asp:TextBox ID="TextBox1" runat="server" Text='<%# Bind("MetricDescription") %>'></asp:TextBox>
                                                                </EditItemTemplate>
                                                                <ItemTemplate>
                                                                    <asp:Label ID="lblMetric" runat="server" Text='<%# Bind("MetricDescription") %>'></asp:Label>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                            <asp:TemplateField HeaderText="Formula" SortExpression="MetricFormula">
                                                                <EditItemTemplate>
                                                                    <asp:TextBox ID="TextBox2" runat="server" Text='<%# Bind("MetricFormula") %>'></asp:TextBox>
                                                                </EditItemTemplate>
                                                                <ItemTemplate>
                                                                    <asp:Label ID="lblFormula" runat="server" Text='<%# Bind("MetricFormula") %>'></asp:Label>
                                                                </ItemTemplate>
                                                               
                                                            </asp:TemplateField>
                                                          <%--  <asp:TemplateField HeaderText="Metric Weightage" SortExpression="MetricWeightage">
                                                                <EditItemTemplate>
                                                                    <asp:TextBox ID="TextBox3" runat="server" Text='<%# Bind("MetricWeightage") %>'></asp:TextBox>
                                                                </EditItemTemplate>
                                                                <ItemTemplate>
                                                                    <asp:Label ID="lblWeightage" runat="server" Text='<%# Bind("MetricWeightage") %>'></asp:Label>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>--%>
                                                           <%-- <asp:TemplateField HeaderText="MetricType" SortExpression="MetricType">
                                                                <EditItemTemplate>
                                                                    <asp:TextBox ID="TextBox4" runat="server" Text='<%# Bind("MetricType") %>'></asp:TextBox>
                                                                </EditItemTemplate>
                                                                <ItemTemplate>
                                                                    <asp:Label ID="lblMetricType" runat="server" Text='<%# Bind("MetricType") %>'></asp:Label>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>--%>
                                                            <asp:TemplateField HeaderText="MetricCategory" SortExpression="MetricCategory">
                                                                <EditItemTemplate>
                                                                    <asp:TextBox ID="txtMetricCategory" runat="server" Text='<%# Bind("MetricCategory") %>'></asp:TextBox>
                                                                </EditItemTemplate>
                                                                <ItemTemplate>
                                                                    <asp:Label ID="lblMetricCategory" runat="server" Text='<%# Bind("MetricCategory") %>'></asp:Label>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                            <asp:TemplateField HeaderText="MetricPriority" SortExpression="MetricPriority">
                                                                <EditItemTemplate>
                                                                    <asp:TextBox ID="txtMetricPriority" runat="server" Text='<%# Bind("MetricPriority") %>'></asp:TextBox>
                                                                </EditItemTemplate>
                                                                <ItemTemplate>
                                                                    <asp:Label ID="lblMetricPriority" runat="server" Text='<%# Bind("MetricPriority") %>'></asp:Label>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                            <asp:TemplateField HeaderText="MeetingQuarter1" SortExpression="MetricQuarter1">
                                                                <EditItemTemplate>
                                                                    <asp:TextBox ID="txtMetricQuarter1" runat="server" Text='<%# Bind("MetricQuarter1") %>'></asp:TextBox>
                                                                </EditItemTemplate>
                                                                <ItemTemplate>
                                                                    <asp:Label ID="lblMetricQuarter1" runat="server" Text='<%# Bind("MetricQuarter1") %>'></asp:Label>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                              <asp:TemplateField HeaderText="MeetingQuarter2" SortExpression="MetricQuarter2">
                                                                <EditItemTemplate>
                                                                    <asp:TextBox ID="txtMetricQuarter2" runat="server" Text='<%# Bind("MetricQuarter2") %>'></asp:TextBox>
                                                                </EditItemTemplate>
                                                                <ItemTemplate>
                                                                    <asp:Label ID="lblMetricQuarter2" runat="server" Text='<%# Bind("MetricQuarter2") %>'></asp:Label>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                              <asp:TemplateField HeaderText="MeetingQuarter3" SortExpression="MetricQuarter3">
                                                                <EditItemTemplate>
                                                                    <asp:TextBox ID="txtMetricQuarter3" runat="server" Text='<%# Bind("MetricQuarter3") %>'></asp:TextBox>
                                                                </EditItemTemplate>
                                                                <ItemTemplate>
                                                                    <asp:Label ID="lblMetricQuarter3" runat="server" Text='<%# Bind("MetricQuarter3") %>'></asp:Label>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                              <asp:TemplateField HeaderText="MeetingQuarter4" SortExpression="MetricQuarter4">
                                                                <EditItemTemplate>
                                                                    <asp:TextBox ID="txtMetricQuarter4" runat="server" Text='<%# Bind("MetricQuarter4") %>'></asp:TextBox>
                                                                </EditItemTemplate>
                                                                <ItemTemplate>
                                                                    <asp:Label ID="lblMetricQuarter4" runat="server" Text='<%# Bind("MetricQuarter4") %>'></asp:Label>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                             <asp:TemplateField HeaderText="FinalDivisionForVerification" SortExpression="FinalVerificationDivision">
                                                                <EditItemTemplate>
                                                                    <asp:TextBox ID="txtFinalVerificationDivision" runat="server" Text='<%# Bind("FinalVerificationDivision") %>'></asp:TextBox>
                                                                </EditItemTemplate>
                                                                <ItemTemplate>
                                                                    <asp:Label ID="lblFinalVerificationDivision" runat="server" Text='<%# Bind("FinalVerificationDivision") %>'></asp:Label>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>

                                                             <asp:TemplateField HeaderText="IsMandatory" SortExpression="IsMandatory">
                                                                <EditItemTemplate>
                                                                    <asp:TextBox ID="txtIsMandatory" runat="server" Text='<%# Bind("IsMandatory") %>'></asp:TextBox>
                                                                </EditItemTemplate>
                                                                <ItemTemplate>
                                                                    <asp:Label ID="lblIsMandatory" runat="server" Text='<%# Bind("IsMandatory") %>'></asp:Label>
                                                                </ItemTemplate>
                                                               
                                                            </asp:TemplateField>


                                                              <asp:TemplateField HeaderText="UMSPath" SortExpression="UMSPath">
                                                                <EditItemTemplate>
                                                                    <asp:TextBox ID="txtUMSPath" runat="server" Text='<%# Bind("UMSPath") %>'></asp:TextBox>
                                                                </EditItemTemplate>
                                                                <ItemTemplate>
                                                                    <asp:Label ID="lblUMSPath" runat="server" Text='<%# Bind("UMSPath") %>'></asp:Label>
                                                                </ItemTemplate>
                                                               
                                                            </asp:TemplateField>
                                                        </Columns>
                                                    </asp:GridView>
                                                </asp:Panel>
                                            </td>
                                        </tr>
                                        <%--<tr>
                                            <td align="center" class="input_form_caption_td" colspan="2">
                                                
                                            </td>
                                        </tr>--%>
                                       <%-- <tr>
                                            <td align="center" class="input_form_caption_td">
                                               
                                            </td>
                                        </tr>--%>
                                    </table>
                                    <table class="align-content-center" style="margin-left:40%; margin-top:2%">
                                        <tr>
                                            <td>

                                            </td>
                                            <td>
                                                <asp:Button ID="btnSaveMetric" runat="server" Height="30px" Width="100px" OnClick="btnSaveMetric_Click" Text="Submit" ValidationGroup="metric" Visible="False" /><asp:Button ID="btnResetMetric" runat="server" CausesValidation="False" Height="30px" Width="100px" OnClick="btnResetMetric_Click" Text="Reset" />
                                                <asp:ValidationSummary ID="ValidationSummary4" runat="server" ShowMessageBox="True" ShowSummary="False" ValidationGroup="metric" />
                                            </td>
                                            <td></td>
                                            <td> <asp:Label ID="lblError1" runat="server"></asp:Label></td>
                                        </tr>
                                    </table>
                                    <br />

                                    <table id="tblMetric" class="table" style="display: none; width: 100%">
                                        <thead>
                                            <tr>
                                                <th>Id</th>
                                                <th>Description</th>
                                                <th>Category</th>
                                                <th>MetricFinal</th>
                                                <th>SourceDiv</th>
                                                <th>OtherDiv</th>
                                                <th>School</th>
                                                
                                                <th>Allocation</th>
                                                 <th>MetricFormula</th>
                                                <th>Metric Priority</th>
                                                <th>Deactive/Edit Metric </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        </tbody>
                                    </table>

                                    <input type="hidden" id="hdnMetricId" value="0" />
                                    <input type="hidden" id="hdnDesc" value="0" />
                                    <!-- Modal -->
                                    <div class="modal fade" id="MetricModal" tabindex="-1" role="dialog" aria-labelledby="MetricModalLabel" aria-hidden="true">
                                        <div class="modal-dialog" role="document">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="MetricModalLabel">Deactive Metric</h5>
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div class="modal-body">
                                                    <label>Enter Reason </label>
                                                    <input type="text" id="txtReason" class="form-control" />
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-primary btn-sm" id="btnDelete">Save changes</button>
                                                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="modal fade" id="RenameMetricModal"  tabindex="-1" role="dialog" aria-labelledby="RenameMetricModalLabel" aria-hidden="true">
                                        <div class="modal-dialog" style="max-width:50%" role="document">            <!-- Added Style 9/8/24  -->
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="RenameMetricModalLabel">Edit Metric</h5>
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div class="modal-body">
                                                    <table >
                                                        <tr>
                                                            <td>
                                                                Division :
                                                            </td>
                                                            <td>
                                                                <label><strong><span id="selectedDivision"  style="font-size:15px;" ></span></strong><span id="selectedDivisionId" style="display:none;"></span></label>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                Criteria :
                                                            </td>
                                                            <td>
                                                                <select id="ddlEditCriteria" onchange="bindeditKeyIndicator();" style="width:250px;"></select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </td>
                                                            <td>
                                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                Change Key Indicator :
                                                            </td>
                                                            <td>
                                                                 <select id="ddlEditKI" style="width:250px;">
                                                                <option id='Select' value="Select">Select Key Indicator</option>
                                                                </select><br />
                                                                <br />

                                                                <label>Current Key Indicator :</label><label><strong><span style="font-size:15px;" id="selectedKeyIndicator"></span></strong></label>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                 Rename Metric Description
                                                            </td>
                                                            <td>
                                                                <textarea class="form-control" rows="2" cols="1" name="txtMetric" id="txtMetric"></textarea>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </td>
                                                            <td>
                                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                Metric category
                                                            </td>
                                                            <td>
                                                                <table>
                                                                    <tr>
                                                                        <td>
                                                                            <input type="radio" id="A" class="rd" name="MetricCategory" value="A">Part-A only
                                                                        </td>
                                                                        <td>
                                                                             <input type="radio" id="B" name="MetricCategory" value="B" class="rd">Part-B only
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>
                                                                            <input type="radio" id="AB" name="MetricCategory" value="AB" class="rd">Part-A & B
                                                                        </td>
                                                                        <td>
                                                                            <input type="radio" id="C" name="MetricCategory" value="C" class="rd">Part-C only
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </td>
                                                            <td>
                                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                             
                                                            <td>
                                                                 Final Division for Verification 
                                                           </td>
                                                            <td><div id="dvFinal" style="display: none;">
                                                              <asp:DropDownList ID="ddlEditFinal" runat="server" Width="250px"></asp:DropDownList></div>
                                                            </td>
                                                            
                                                        </tr>
                                                         
                                                    </table>
                                                    <hr />
                                                 <div id="dvMetricAllocation" >
                                                 <table>
                                                     <tr>
                                                         <td>                                                             
                                                          Source Division Allocation upto Level :
                                                             </td>
                                                         <td>
                                                          <asp:DropDownList ID="ddlSourceDivLevel1" runat="server" Width="250px" ></asp:DropDownList><br />
                                                       </td>
                                                     </tr>
                                                      <tr>
                                                            <td>
                                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </td>
                                                            <td>
                                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </td>
                                                        </tr>
                                                     <tr>
                                                         <td>

                                                          School Allocation upto Level :
                                                             </td>
                                                         <td>
                                                             <asp:DropDownList ID="ddlSchoolLevel1" runat="server" Width="250px" ></asp:DropDownList><br />
                                                             </td>
                                                         </tr>
                                                      <tr>
                                                            <td>
                                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </td>
                                                            <td>
                                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </td>
                                                        </tr>
                                                         <tr>
                                                         <td>

                                                          Other Division Allocation upto Level :
                                                             </td>
                                                             <td>
                                                         <asp:DropDownList ID="ddlDivisionLevel1" runat="server" Width="250px"></asp:DropDownList>
                                                             <br />
                                                         </td>
                                                       </tr>  
                                                      <tr>
                                                            <td>
                                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </td>
                                                            <td>
                                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            </td>
                                                        </tr>
                                                     <tr>
                                                         <td>
                                                             MetricFormula
                                                             </td>
                                                           <td>   
                                                              <input type="text" id="txtMetricFormula" class="form-control" />
                                                   
                                                         </td>
                                                     </tr>
                                                 </table>
                                                 </div>   
                                                        
                                                 
                                                   
                                                   <%-- <div class="form-group">
                                                        <label>Metric Weightage</label>
                                                        <input type="text" class="form-control" id="txtWeightage" />
                                                    </div>--%>
                                                     
                                                    <hr />
                                                    <table>
                                                        <tr>
                                                            <td>
                                                                Metric Priority :
                                                            </td>
                                                            <td>
                                                                <input type="radio" id="L" class="rd" name="MetricPriority" value="L">
                                                            Low
                                                            </td>
                                                            
                                                            <td>
                                                                <input type="radio" id="M" class="rd" name="MetricPriority" value="M">
                                                            Medium
                                                            </td>
                                                            <td>
                                                                <input type="radio" id="H" class="rd" name="MetricPriority" value="H">
                                                            High
                                                            </td>
                                                            <td>

                                                            </td>
                                                           
                                                        </tr>
                                                        <tr>
                                                            <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
                                                        </tr>

                                                         <tr>
                                                            <td>
                                                               Metric Discussion Quarter(s) :
                                                            </td>
                                                            <td>
                                                                <input type="checkbox" id="chkren1" class="chren" name="chkrenQuarter1" value="1">
                                                            Quarter 1
                                                            </td>
                                                            <td>
                                                                <input type="checkbox" id="chkren2" class="chren" name="chkrenQuarter2" value="2">
                                                            Quarter 2
                                                            </td>
                                                            <td>
                                                                <input type="checkbox" id="chkren3" class="chren" name="chkrenQuarter3" value="3">
                                                            Quarter 3
                                                            </td>
                                                              <td>
                                                                <input type="checkbox" id="chkren4" class="chren" name="chkrenQuarter4" value="4">
                                                            Quarter 4
                                                            </td>
                                                        </tr>
                                                          <tr>
                                                            <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                               Mark As Exclusive? :
                                                            </td>
                                                            <td>
                                                                <input type="radio" id="YExclusive" class="rd" name="IsExclusive" value="1">
                                                            Yes
                                                            </td>
                                                            <td>
                                                                <input type="radio" id="NExclusive" class="rd" name="IsExclusive" value="0">
                                                            No
                                                            </td>
                                                            <td>
                                                                
                                                            </td>
                                                              <td>
                                                               
                                                            </td>
                                                        </tr>

                                                         <tr>
                                                              <td>IsMandatory? :
                                                              </td>
                                                              <td>
                                                                   <input type="radio" id="YisMandatory" class="rdisMand" name="isMandatoryN" value="1">
                                                                   Yes
                                                              </td>
                                                              <td>
                                                                   <input type="radio" id="NisMandatory" class="rdisMand" name="isMandatoryN" value="0" >
                                                                   No
                                                              </td>
                                                              <td></td>
                                                              <td></td>
                                                         </tr>

                                                         <tr>
                                                              <td>UMS Path? :
                                                              </td>
                                                              <td>
                                                                  <input type="text" id="umsPath"  />
                                                              </td>
                                                              <td></td>
                                                              <td></td>
                                                         </tr>
                                                    </table>
      
                                                    <%--<input type="text" id="txtMetric"  />--%>
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-primary btn-sm" id="btnRename">Save changes</button>
                                                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                     <div class="modal fade" id="MetricModalActive" tabindex="-1" role="dialog" aria-labelledby="MetricModalLabelActive" aria-hidden="true">
                                        <div class="modal-dialog" role="document">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="MetricModalLabelActive">Active Metric</h5>
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div class="modal-body">
                                                    <label>Enter Reason </label>
                                                    <input type="text" id="txtMetricReasonActive" class="form-control" />
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-primary btn-sm" id="btnActiveMetric">Save changes</button>
                                                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ContentTemplate>
                                <Triggers>
                                    <asp:PostBackTrigger ControlID="lnkExportMetric" />
                                    <asp:PostBackTrigger ControlID="lnkExportMetricDyn" />
                                    <asp:PostBackTrigger ControlID="btnMetricUpload" />
                                </Triggers>
                            </asp:UpdatePanel>

                        </ContentTemplate>

                    </cc1:TabPanel>
                
                    <cc1:TabPanel ID="TabPanel5" runat="server" HeaderText="TabPanel5">
                        <HeaderTemplate>
                           Metric Source
                        
                        </HeaderTemplate>
                        <ContentTemplate>
                               <asp:UpdatePanel ID="UpdatePanel6" runat="server">
                                <ContentTemplate>
                                    <script type="text/javascript">

                                         Sys.Application.add_load(function () {
                                              ShowAccreditationMapping();

                                              $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel5_lstAccreditation').select2({ tags: true });
                                              $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel5_lstAccreditationMain').select2({ tags: true });
                                              $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel5_lstAccreditationSubPoints').select2({ tags: true });
                                              $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel5_lstAccreditationSubPoints1').select2({ tags: true });

                                         });
                                         function GetMetricAccreditationList() {
                                              $('#tblMetricAccreditationList').show();
                                              $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel5_tblAccreditation').show();
                                              $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel5_btnSaveAccre').show();
                                              $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel5_lstAccreditation').show();
                                              $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel5_btnSaveAccre').show();
                                              //debugger;
                                              if ($.fn.DataTable.isDataTable('#tblMetricAccreditationList')) {
                                                   $('#tblMetricAccreditationList').DataTable().destroy();
                                              }
                                              var MetricId = $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel5_ddlMetricAccre').val();

                                              if (MetricId != null && MetricId != 'Select') {
                                                   $.ajax({
                                                        type: "POST",
                                                        url: "frmCriteriaMaster.aspx/GetMetricsAccreditation",
                                                        data: JSON.stringify({
                                                             MetricId: MetricId
                                                        }),
                                                        contentType: "application/json; charset=utf-8",
                                                        dataType: "json",
                                                        success: OnSuccessMetricAccreList,
                                                        failure: function (response) {
                                                             alert(response.d);
                                                        },
                                                        error: function (response) {
                                                             alert(response.d);
                                                        },
                                                        complete: function () {
                                                        }

                                                   });
                                              }
                                              $('#tblMetricAccreditationList').show();
                                              $('#lstAccreditationMain option').empty();
                                              $('#lstAccreditationSubPoints option').empty();
                                              $('#lstAccreditationSubPoints1 option').empty();
                                              $('#lstAccreditationMain option').hide();
                                              $('#lstAccreditationSubPoints option').hide();
                                              $('#lstAccreditationSubPoints1 option').hide();
                                              //$('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel5_lstAccreditation option').remove();
                                         }

                                         function OnSuccessMetricAccreList(response) {
                                              //debugger;
                                              $("#tblMetricAccreditationList").DataTable(
                                                   {
                                                        dom: 'Bfrtip',
                                                        bLengthChange: true,
                                                        lengthMenu: [[50, 100, -1], [50, 100, "All"]],
                                                        bFilter: true,
                                                        bSort: true,
                                                        bPaginate: true,
                                                        data: response.d,

                                                        columns: [{ "data": "Id" },
                                                        { "data": "Name" },
                                                        { "data": "MetricId" },
                                                        {
                                                             "data": "IsActive",
                                                             "render": function (data, type, row, meta) {
                                                                  if (type === 'display') {
                                                                       if (row.IsActive == true)
                                                                            data = '<a href="javascript:void(0)" class="btn btn-sm btn-warning" data-toggle="modal" onclick="setDeactiveId(' + "'" + row.Id + "'" + ')" >Deactive</a> '
                                                                       else
                                                                            data = '<a href="javascript:void(0)" class="btn btn-sm btn-danger" data-toggle="modal" onclick="setActiveId(' + "'" + row.Id + "'" + ')" >Active</a> '

                                                                  }



                                                                  return data;
                                                             }
                                                        }


                                                        ],

                                                        buttons: [{
                                                             extend: 'excel',
                                                             text: 'Export to Excel',
                                                             className: 'btn btn-warning',
                                                             filename: 'MetricAccreditationList',
                                                             exportOptions: { columns: [1, 2, 3], modifier: { page: 'all' /*'current'*/ } }

                                                        }]
                                                   }).columns.adjust();

                                         };
                                         function ShowAccreditationMapping() {
                                              $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel5_ddlMetricAccre').change(function (e) {
                                                   // alert('infn');
                                                   e.preventDefault();
                                                   GetMetricAccreditationList();

                                                   $('#tblMetricAccreditationList').show();

                                              })
                                         }
                                         function setActiveId(Id) {
                                              $.ajax({
                                                   type: "POST",
                                                   url: "frmCriteriaMaster.aspx/DeleteAccreditation",
                                                   contentType: "application/json; charset=utf-8",
                                                   dataType: "json",
                                                   data: JSON.stringify({
                                                        Id: Id, IsActive: 1
                                                   }),
                                                   success: function (data) {
                                                        //debugger;
                                                        var msg = data.d;
                                                        if (msg == "Active successfuly") {
                                                             setTimeout(function () {
                                                                  swal({ title: "", text: msg, type: "success" },
                                                                       function () {
                                                                            GetMetricAccreditationList();

                                                                       })
                                                             }, 1000)
                                                        }
                                                        else
                                                             alert(msg);

                                                   },
                                                   failure: function (response) {
                                                        alert(response.d);
                                                   },
                                                   error: function (response) {
                                                        alert(response.d);
                                                   }
                                              })
                                         }
                                         function setDeactiveId(Id) {



                                              swal({
                                                   title: "Confirm Action",
                                                   text: "Are you sure to delete accreditation?",
                                                   closeOnConfirm: true,
                                                   closeOnCancel: true,
                                                   showCancelButton: true,
                                                   confirmButtonText: "Yes",
                                                   cancelButtonText: "No"

                                              },
                                                   function (isConfirm) {
                                                        if (isConfirm) {


                                                             $.ajax({
                                                                  type: "POST",
                                                                  url: "frmCriteriaMaster.aspx/DeleteAccreditation",
                                                                  contentType: "application/json; charset=utf-8",
                                                                  dataType: "json",
                                                                  data: JSON.stringify({
                                                                       Id: Id, IsActive: 0
                                                                  }),
                                                                  success: function (data) {
                                                                       //debugger;
                                                                       var msg = data.d;
                                                                       if (msg == "Deactive successfuly") {
                                                                            setTimeout(function () {
                                                                                 swal({ title: "", text: msg, type: "success" },
                                                                                      function () {
                                                                                           GetMetricAccreditationList();

                                                                                      })
                                                                            }, 1000)
                                                                       }
                                                                       else
                                                                            alert(msg);

                                                                  },
                                                                  failure: function (response) {
                                                                       alert(response.d);
                                                                  },
                                                                  error: function (response) {
                                                                       alert(response.d);
                                                                  }
                                                             })
                                                        }


                                                   }
                                              );
                                         }

                                    </script>
                                 <%--    <script type="text/javascript" language="javascript">
                                 
                                         Sys.Application.add_load();
                                 </script>--%>
                             <table align="center" bgcolor="#cccccc" border="0" cellpadding="1" cellspacing="1" width="100%">
                                                   
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label18" runat="server" Text="Division :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlDivisionAccrre" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlDivisionAccrre_SelectedIndexChanged" OnDataBound="ddlDivisionAccrre_DataBound" Width="250px"></asp:DropDownList>
                                                            <asp:RequiredFieldValidator ID="RequiredFieldValidator6" runat="server" ControlToValidate="ddlDivisionAccrre" ErrorMessage="Please select division" InitialValue="Select" ForeColor="Red" ValidationGroup="Accre">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label19" runat="server" Text="Criteria :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlCriteriaAccrre" OnDataBound="ddlCriteriaAccrre_DataBound" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlCriteriaAccrre_SelectedIndexChanged"  Width="250px"></asp:DropDownList><asp:RequiredFieldValidator ID="RequiredFieldValidator11" ForeColor="Red" runat="server" ControlToValidate="ddlCriteriaAccrre" ErrorMessage="Please select criteria" InitialValue="Select" ValidationGroup="Accre">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label20" runat="server" Text="Key Indicator :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlKiAccre" OnDataBound="ddlKiAccre_DataBound" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlKiAccre_SelectedIndexChanged"  Width="250px"></asp:DropDownList><asp:RequiredFieldValidator ID="RequiredFieldValidator18" runat="server" ForeColor="Red" ControlToValidate="ddlKiAccre" ErrorMessage="Please select key indicator" InitialValue="Select" ValidationGroup="Accre">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label21" runat="server" Text="Metric :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlMetricAccre" OnDataBound="ddlMetricAccre_DataBound"  runat="server"  Width="250px" ></asp:DropDownList><asp:RequiredFieldValidator ID="RequiredFieldValidator35" runat="server" ForeColor="Red" ControlToValidate="ddlMetricAccre" ErrorMessage="Please select Metric" InitialValue="Select" ValidationGroup="Accre">*</asp:RequiredFieldValidator></td>
                                                        <%--AutoPostBack="True" OnSelectedIndexChanged="ddlStageMetric_SelectedIndexChanged"--%>
                                                    </tr>
                                                   
                                                </table>  
                                    <br />
                                    <br />
                                         <table class="table-bordered table" style="width:100%" id ="tblAccreditation" runat="server" >
                                                            <tr>
                                                                <td style="width:170px">
                                                                   
                                                                  <asp:Label ID="lbl1" runat="server">Source</asp:Label>  
                                                                </td>
                                                                <td >
                                                                   
                                                                     <asp:ListBox ID="lstAccreditation" runat="server" style="width:300px"
                                                             SelectionMode="Multiple"
                                                            OnSelectedIndexChanged="lstAccreditation_SelectedIndexChanged" AutoPostBack="true" >
                                                            </asp:ListBox>
                                                                </td>
                                                                
                                                                <td>
                                                                     <label>Select Main Point</label><br />
                                                                    <asp:ListBox ID="lstAccreditationMain" Visible="false" runat="server" 
                                                            Width="200px" SelectionMode="Multiple"
                                                            OnSelectedIndexChanged="lstAccreditationMain_SelectedIndexChanged" AutoPostBack="true" >
                                                            </asp:ListBox>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                            
                                                                <td> <asp:Label ID="lblSub" runat="server">Subpoints</asp:Label></td>
                                                                <td>
                                                                    <asp:ListBox ID="lstAccreditationSubPoints" Visible="false" runat="server" style="width:300px"
                                                             SelectionMode="Multiple" CssClass="mySelect2"
                                                            OnSelectedIndexChanged="lstAccreditationSubPoints_SelectedIndexChanged" AutoPostBack="true" >
                                                            </asp:ListBox>
                                                                </td>
                                                              
                                                                <td>
                                                                    <asp:ListBox ID="lstAccreditationSubPoints1" Visible="false" runat="server" style="width:300px"
                                                             SelectionMode="Multiple"
                                                            OnSelectedIndexChanged="lstAccreditationSubPoints1_SelectedIndexChanged" AutoPostBack="true" >
                                                            </asp:ListBox>
                                                                 </td>
                                                            </tr>
                                                        </table>
                                    <div style="margin-left:50%">
                                          <asp:Button ID="btnSaveAccre"  Height="30px" Width="100px" runat="server" Text="Submit" OnClick="btnSaveAccre_Click" ValidationGroup="Accre" />
                                        <asp:Button ID="btnResetAccre" runat="server" Height="30px" Width="100px" Text="Reset" OnClick="btnResetAccre_Click" />
                                      
                                    </div>
                                     <table id="tblMetricAccreditationList" class="table" style=" width: 100%">
                                        <thead>
                                            <tr>
                                                <th>Id</th>
                                                <th>Name</th>
												<th>Metric Id</th>
                                                <th>IsActive</th>
                                                
                                            </tr>
                                        </thead>
                                        <tbody>
                                        </tbody>
                                    </table>
                                    </ContentTemplate>
                                    </asp:UpdatePanel>
                        </ContentTemplate>
                    </cc1:TabPanel>
                      <cc1:TabPanel ID="TabPanel6" runat="server" HeaderText="TabPanel6">
                        <HeaderTemplate>
                           Metric Weightage
                        </HeaderTemplate>
                        <ContentTemplate>
                                                    <script type="text/javascript" src="js/jquery-2.1.3.min.js"></script>
                                    <script type="text/javascript" src="js/jquery-ui-1.12.1.min.js"></script>
                                    <script type="text/javascript" src="Repository/datatables/js/datatables.min.js"></script>
                                    <link href="css/jquery-ui-1.12.1.min.css" rel="stylesheet" />
                                    <link href="Repository/datatables/css/datatables.min.css" rel="stylesheet" />
                                    <link href="js1/sweetalert.css" rel="stylesheet" />
                                    <script src="js1/sweetalert.min.js"></script>
                                    <script type="text/javascript" src="Repository/bootstrap/js/select2.min.js"></script>
                                    <link href="Repository/bootstrap/css/select2.min.css" rel="stylesheet" />
                             <script type="text/javascript">
                              
                                    function GetMetricWeightage() {
                                        //debugger;
                                        // alert('metric');
                                        if ($.fn.DataTable.isDataTable('#tblMetricWeightage')) {
                                            $('#tblMetricWeightage').DataTable().destroy();
                                        }
                                        var KeyIndicator = $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel6_ddlKeyWeightage').val();
                                        var Session=$('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel6_ddlSessionWeightage').val();
                                        // alert(Indicator);
                                        if (KeyIndicator != null && KeyIndicator != 'Select') {
                                            $.ajax({
                                                type: "POST",
                                                url: "frmCriteriaMaster.aspx/GetMetricsWeightage",
                                                data: JSON.stringify({
                                                    IndicatorId: KeyIndicator, plannerSessionId: Session
                                                }),
                                                contentType: "application/json; charset=utf-8",
                                                dataType: "json",
                                                success: OnSuccessWeightage,
                                                failure: function (response) {
                                                    alert(response.d);
                                                },
                                                error: function (response) {
                                                    alert(response.d);
                                                },
                                                complete: function () {
                                                }

                                            });
                                        }
                                    }
                                    function OnSuccessWeightage(response) {
                                        //debugger;
                                        $('#tblMetricWeightage').show();
                                        $("#tblMetricWeightage").DataTable(
                                        {
                                            dom: 'Bfrtip',
                                            bLengthChange: true,
                                            lengthMenu: [[50, 100, -1], [50, 100, "All"]],
                                            bFilter: true,
                                            bSort: true,
                                                data: response.d,
                                            paging:true,

                                            columns: [
                                                 { "data": "SNo" },
                                                  { "data": "MetricId" },
                                                { "data": "Metric" },
                                              
                                               {
                                                   "data": "Weightage",
                                                   render: function (data, type, row) {
                                                       if(row.MetricId!=0)
                                                           return '<input style="width:100px;height:35px" type="number" min="0" class="form-control weightage"  onchange="CalculateWeightage()" onkeyup="CalculateWeightage()" type="text"  value = ' + row.Weightage + '  >';
                                                       else
                                                           return '<input id="txtTotalWeightage" class="form-control weightage"  type="text" disabled  value = ' + row.Weightage + '  >';
                                                   }
                                               }
                                            ],
                                            //columnDefs: [
                                          
                                            ////{ width: 150, targets: 3 },
                                            //{ visible: false, targets: 1 },
                                            
                                            //],

                                            buttons: [{
                                                extend: 'excel',
                                                text: 'Export to Excel',
                                                className: 'btn btn-warning',
                                                filename: 'MetricWeightage',
                                                exportOptions: { columns: [0, 1], modifier: { page: 'all' /*'current'*/ } }

                                            }]
                                        }).columns.adjust();
                                       
                                    };
                                    $(document).ready(function () {
                                       
                                        //$('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel6_ddlKeyWeightage').select2();
                                        //$('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel6_ddlWeghtageCriteria').select2();
                                        //$('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel6_ddlDivWeightage').select2();
                                        //$('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel6_ddlSessionWeightage').select2();
                                        AddSelect2();
                                    });
                                    function AddSelect2()
                                    {
                                        $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel6_ddlKeyWeightage').select2();
                                        $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel6_ddlWeghtageCriteria').select2();
                                        $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel6_ddlDivWeightage').select2();
                                        $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel6_ddlSessionWeightage').select2();
                                    }
                                    //function Select() {
                                    //    var callbacks = $.Callbacks();
                                    //    callbacks.add(AddSelect2);
                                    //}
                                    function CalculateWeightage()
                                    {
                                        var total = 0;
                                        //$('.weightage').change(function () {
                                        $(".weightage").each(function () {
                                            //debugger;
                                            var isDisabled = $(this).prop('disabled');

                                            if (isDisabled != true) {
                                                if ($(this).val()!="")
                                                total = total + parseFloat($(this).val());

                                            }
                                        });
                                        $('#txtTotalWeightage').val(total);
                                        if(total>100)
                                        {
                                            swal("Total weightage of  selected Indicator cannot be grater than 100");
                                        }
                                            //alert(total);
                                       //  })
                                        
                                    }
                                    function MetiricWeightage() {
                                        $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel6_ddlKeyWeightage').change(function () {
                                            if ($('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel6_ddlKeyWeightage option:selected').val() != "0") {

                                                GetMetricWeightage();

                                                $('#tblMetricWeightage').show();
                                               // $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel6_btnSaveWeightage').show();

                                            }
                                        })
                                       
                                    }
                                    function SaveWeightage()
                                    {
                                       // debugger;
                                        if ($('#txtTotalWeightage').val() > 100) {
                                            swal("Metric(s) weightage exceed from 100");
                                            return false;
                                        }
                                        else {
                                            var dtTable = $('#tblMetricWeightage').DataTable()
                                            var TableData = new Array();
                                            var Session = $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel6_ddlSessionWeightage option:selected').val();
                                           // alert(Session);
                                            $('#tblMetricWeightage tr').each(function (row1, tr) {
                                                //debugger;
                                               
                                                var disable = $(this).find('.weightage').prop('disabled');
                                               
                                                if (disable != undefined) {
                                                if (disable != true) {
                                                    var weightage = $(this).find('.weightage').val();
                                                    //alert($(this).find("td:nth-child(1)").html());
                                                    TableData[row1] = {
                                                        "MetricId": $(this).find("td:nth-child(2)").html()
                                                        , "Weightage": weightage
                                                    , "Session": Session

                                                    }
                                                }
                                                   
                                                }
                                               
                                            });
                                            $.ajax({
                                                type: "POST",
                                                url: "frmCriteriaMaster.aspx/SaveWeightage",
                                                contentType: "application/json; charset=utf-8",
                                                dataType: "json",
                                                data: JSON.stringify({
                                                    lstUpdateData: TableData
                                                }),
                                                success: function (data) {
                                                    var msg = data.d;
                                                   
                                                   // alert(1);
                                                    
                                                    swal('Weighatge Save Successfully !');
                                                    /*GetMetricWeightage();*/
                                                   // debugger;
                                                    
                                                    $("#ddlKeyWeightage")
                                                    $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel6_ddlKeyWeightage').select2("val", "");
                                                    GetMetricWeightage();
                                                    $('#tblMetricWeightage').show();
                                                    MetiricWeightage();
                                                    return;
                                                },
                                                failure: function (response) {
                                                    $('#tblMetricWeightage').show();
                                                    alert(response.d);
                                                },
                                                error: function (xhr, status, error) {
                                                    $('#tblMetricWeightage').show();
                                                    var err = eval("(" + xhr.responseText + ")");
                                                    alert(err.Message);;
                                                }
                                            })
                                        }
                                    }
                                   
                             </script>
                             <script type="text/javascript" language="javascript">
                                 Sys.Application.add_load(MetiricWeightage);
                                 Sys.Application.add_load(AddSelect2);
                                 </script>
                               <asp:UpdatePanel ID="UpdatePanel5" runat="server">
                                <ContentTemplate>
                                   
                             <table align="center" bgcolor="#cccccc" border="0" cellpadding="1" cellspacing="1" width="100%">
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label28" runat="server" Text="Planner Session :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlSessionWeightage" runat="server" AutoPostBack="True"   Width="250px"></asp:DropDownList>
                                                            <asp:RequiredFieldValidator ID="RequiredFieldValidator40" runat="server" ControlToValidate="ddlSessionWeightage" ErrorMessage="Please select division" InitialValue="Select" ForeColor="Red" ValidationGroup="Weightage">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label22" runat="server" Text="Division :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlDivWeightage" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlDivWeightage_SelectedIndexChanged" OnDataBound="ddlDivWeightage_DataBound" Width="250px"></asp:DropDownList>
                                                            <asp:RequiredFieldValidator ID="RequiredFieldValidator36" runat="server" ControlToValidate="ddlDivWeightage" ErrorMessage="Please select division" InitialValue="Select" ForeColor="Red" ValidationGroup="Weightage">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label23" runat="server" Text="Criteria :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlWeghtageCriteria" OnDataBound="ddlWeghtageCriteria_DataBound" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlWeghtageCriteria_SelectedIndexChanged"  Width="250px"></asp:DropDownList><asp:RequiredFieldValidator ID="RequiredFieldValidator37" ForeColor="Red" runat="server" ControlToValidate="ddlWeghtageCriteria" ErrorMessage="Please select criteria" InitialValue="Select" ValidationGroup="Weightage">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label24" runat="server" Text="Key Indicator :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlKeyWeightage" OnDataBound="ddlKeyWeightage_DataBound" runat="server"   Width="250px"></asp:DropDownList><asp:RequiredFieldValidator ID="RequiredFieldValidator38" runat="server" ForeColor="Red" ControlToValidate="ddlKeyWeightage" ErrorMessage="Please select key indicator" InitialValue="Select" ValidationGroup="Weightage">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                   <%-- <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label25" runat="server" Text="Metric :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlMetricWeightage" OnDataBound="ddlMetricWeightage_DataBound" OnSelectedIndexChanged="ddlMetricWeightage_SelectedIndexChanged" AutoPostBack="true" runat="server"  Width="250px" ></asp:DropDownList><asp:RequiredFieldValidator ID="RequiredFieldValidator39" runat="server" ForeColor="Red" ControlToValidate="ddlMetricWeightage" ErrorMessage="Please select Metric" InitialValue="Select" ValidationGroup="Weightage">*</asp:RequiredFieldValidator></td>
                                                      
                                                    </tr>--%>
                                                 <%--  <tr id="trWeightage" style="display:none">
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label26" runat="server" Text="Metric Weightage :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:TextBox ID="txtMetricWeightage1" runat="server"></asp:TextBox>
                                                          </td>
                                                    </tr>--%>
                                                  <%-- </tr>--%>
                                                </table>  
                                    <br />
                                    <br />
                                      
                                    
                                        <table id="tblMetricWeightage" class="table" style="display: none; width: 100%">
                                        <thead>
                                            <tr>
                                                <th>SNo</th>
                                                 <th>MetricId</th>
                                                <th>Description</th>
                                              
                                                <th>Weightage</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        </tbody>
                                    </table>
                                           
                                    <div style="margin-left:40%">
                                        
                                        <asp:Button ID="btnSaveWeightage"  Height="30px" Width="100px" runat="server" Text="Submit" OnClientClick="SaveWeightage()" ValidationGroup="Weightage" />
                                        <asp:Button ID="Button1" runat="server" Height="30px" Width="100px" Text="Reset" OnClick="btnResetWeightage_Click" />
                                        <%--<button type="button" id="" onclick="">--%>
                                    </div>
                               <%--     <table>
                                        <tr>
                                            <td colspan="2"></td>
                                            <td><asp:TextBox ID ="txtTotalWeightage" runat="server"></asp:TextBox></td>
                                        </tr>
                                    </table>--%>
                                    </ContentTemplate>
                                    </asp:UpdatePanel>
                        </ContentTemplate>
                    </cc1:TabPanel>
                        <cc1:TabPanel ID="TabPanel4" runat="server" HeaderText="TabPanel4">
                        <HeaderTemplate>
                            Miscellaneous
                        
                        </HeaderTemplate>

                        <ContentTemplate>
                            <script type="text/javascript" src="js/jquery-2.1.3.min.js"></script>
                                    <script type="text/javascript" src="js/jquery-ui-1.12.1.min.js"></script>
                                    <script type="text/javascript" src="Repository/datatables/js/datatables.min.js"></script>
                                    <link href="css/jquery-ui-1.12.1.min.css" rel="stylesheet" />
                                    <link href="Repository/datatables/css/datatables.min.css" rel="stylesheet" />
                                    <link href="js1/sweetalert.css" rel="stylesheet" />
                                    <script src="js1/sweetalert.min.js"></script>
                                    <script type="text/javascript" src="Repository/bootstrap/js/select2.min.js"></script>
                                    <link href="Repository/bootstrap/css/select2.min.css" rel="stylesheet" />
                             <script type="text/javascript">
                                 function setStageId(Id) {
                                    
                                            $('#hdnStageId').val(Id);
                                 }
                                 function setCheckListId(Id,Active) {
                                     $('#hdnCheckListId').val(Id);
                                   
                                 }
                                    function GetStages() {
                                        //debugger;
                                        // alert('metric');
                                        if ($.fn.DataTable.isDataTable('#tblStage')) {
                                            $('#tblStage').DataTable().destroy();
                                        }
                                        var MetricId = $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel4_ddlStageMetric').val();
                                        // alert(Indicator);
                                        if (MetricId != null && MetricId != 'Select') {
                                            $.ajax({
                                                type: "POST",
                                                url: "frmCriteriaMaster.aspx/GetStages",
                                                data: JSON.stringify({
                                                    MetricId: MetricId
                                                }),
                                                contentType: "application/json; charset=utf-8",
                                                dataType: "json",
                                                success: OnSuccessStages,
                                                failure: function (response) {
                                                    alert(response.d);
                                                },
                                                error: function (response) {
                                                    alert(response.d);
                                                },
                                                complete: function () {
                                                }

                                            });
                                        }
                                    }
                                    function OnSuccessStages(response) {
                                        //debugger;
                                        $("#tblStage").DataTable(
                                        {
                                            dom: 'Bfrtip',
                                            bLengthChange: true,
                                            lengthMenu: [[50, 100, -1], [50, 100, "All"]],
                                            bFilter: true,
                                            bSort: true,
                                            bPaginate: true,
                                            data: response.d,

                                            columns: [{ "data": "StageId" },
                                                { "data": "StageName" },
                                               { "data": "Applicable" },
                                                { "data": "DisplayOrder" },
                                              
                                               {
                                                   "data": "IsActive",
                                                   "render": function (data, type, row, meta) {
                                                       if (type === 'display') {
                                                           if (row.IsActive == true)
                                                               data = '<a href="javascript:void(0)" class="btn btn-sm btn-warning" data-toggle="modal" onclick="setStageId(' + "'" + row.StageId + "'" + ')" data-target="#StageModal"  data-backdrop="static" data-keyboard="false">Deactive</a> <a href="javascript:void(0)" class="btn btn-sm btn-info" data-toggle="modal" onclick="setStageIdandDesc(' + "'" + row.StageId + "'," + "'" + row.StageName.replace(/\s{2,}/g, ' ').trim().replace(/\r/g, "").replace(/\n/g, "").replace(/'/g, "") + "'," + "'" + row.Applicable + "'," + "'" + row.DisplayOrder + "'" + ')" data-target="#RenameStageModal"  data-backdrop="static" data-keyboard="false">Edit</a>'
                                                           else
                                                               data = '<a href="javascript:void(0)" class="btn btn-sm btn-danger" data-toggle="modal" onclick="setStageId(' + "'" + row.StageId + "'" + ')" data-target="#StageModalActive"  data-backdrop="static" data-keyboard="false">Active</a> '

                                                       }



                                                       return data;
                                                   }
                                               }

                                            ],
                                            columnDefs: [
                                          
                                            { width: 150, targets: 4 },
                                            //{ visible: false, targets: 0 },
                                            
                                            ],

                                            buttons: [{
                                                extend: 'excel',
                                                text: 'Export to Excel',
                                                className: 'btn btn-warning',
                                                filename: 'MetricTargetApproval',
                                                exportOptions: { columns: [0, 1], modifier: { page: 'all' /*'current'*/ } }

                                            }]
                                        }).columns.adjust();
                                       
                                    };



                                    function Stages() {
                                        $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel4_ddlStageMetric').change(function (e) {
                                            // alert('infn');
                                            e.preventDefault();
                                            var option = $("input[type='radio'][name='ctl00$ContentPlaceHolder1$TabContainer1$TabPanel4$rblStagesOrCheckList']:checked");
                                            //alert(option.val());
                                            if (option.val() == 'SA') {
                                                //alert(option.val());
                                                GetStages();
                                                $('#tblStage').show();
                                            }
                                            else if (option.val() == 'MC') {
                                               // alert(option.val());
                                                GetCheckList();
                                                $('#tblCheckList').show();
                                            }
                                            else if (option.val() == 'DC') {
                                                //alert(option.val());
                                                var option1 = $("input[type='radio'][name='ctl00$ContentPlaceHolder1$TabContainer1$TabPanel4$rbtnLstDocumentType']:checked");
                                                //alert(option1).val();
                                                if (option1.val() == 'V') {
                                                    GetDocList();
                                                    $('#tblDocList').show();
                                                }

                                            }
                                               // GetCheckList();
                                               
                                           

                                        })
                                    }
                                    function CheckList() {
                                       // $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel4_rblStagesOrCheckList').change(function (e) {
                                            if ($('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel4_rblStagesOrCheckList input:checked').val() == "MC") {
                                                // alert('infn');
                                               // e.preventDefault();
                                                GetCheckList();

                                                $('#tblCheckList').show();
                                            }

                                        //})
                                    }
                                    function GetCheckList() {
                                        //debugger;
                                        // alert('metric');
                                        if ($.fn.DataTable.isDataTable('#tblCheckList')) {
                                            $('#tblCheckList').DataTable().destroy();
                                        }
                                        var MetricId = $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel4_ddlStageMetric').val();
                                        // alert(Indicator);
                                        if (MetricId != null && MetricId != 'Select') {
                                            $.ajax({
                                                type: "POST",
                                                url: "frmCriteriaMaster.aspx/GetCheckList",
                                                data: JSON.stringify({
                                                    MetricId: MetricId
                                                }),
                                                contentType: "application/json; charset=utf-8",
                                                dataType: "json",
                                                success: OnSuccessCheckList,
                                                failure: function (response) {
                                                    alert(response.d);
                                                },
                                                error: function (response) {
                                                    alert(response.d);
                                                },
                                                complete: function () {
                                                }

                                            });
                                        }
                                    }
                                    function OnSuccessCheckList(response) {
                                        //debugger;
                                        $("#tblCheckList").DataTable(
                                        {
                                            dom: 'Bfrtip',
                                            bLengthChange: true,
                                            lengthMenu: [[50, 100, -1], [50, 100, "All"]],
                                            bFilter: true,
                                            bSort: true,
                                            bPaginate: true,
                                            data: response.d,

                                            columns: [{ "data": "ChklstId" },
                                                { "data": "ChklstName" },
                                               { "data": "Displayorder" },
                                               { "data": "Required" },
                                               {
                                                   "data": "IsActive",
                                                   "render": function (data, type, row, meta) {
                                                       if (type === 'display') {
                                                           if (row.IsActive == true)
                                                               data = '<a href="javascript:void(0)" class="btn btn-sm btn-warning ActiveChk" data-target="#ChklstModalDe" data-toggle="modal" onclick="setCheckListId(' + "'" + row.ChklstId + "'," + "'0'" + ')"  data-backdrop="static" data-keyboard="false">Deactive</a> <a href="javascript:void(0)" class="btn btn-sm btn-info" data-toggle="modal" onclick="setCheckListIdandDesc(' + "'" + row.ChklstId + "'," + "'" + row.ChklstName.replace(/\s{2,}/g, ' ').trim().replace(/\r/g, "").replace(/\n/g, "").replace(/'/g, "") + "'," + "'" + row.Required + "'," + "'" + row.Displayorder + "'" + ')" data-target="#RenameCheckListModal"  data-backdrop="static" data-keyboard="false">Edit</a>'
                                                           else
                                                               data = '<a href="javascript:void(0)" class="btn btn-sm btn-danger ActiveChk" data-target="#ChklstActiveModal" data-toggle="modal" onclick="setCheckListId(' + "'" + row.ChklstId + "'," + "'1'" + ');"   data-backdrop="static" data-keyboard="false">Active</a> '

                                                       }



                                                       return data;
                                                   }
                                               }

                                            ],
                                            columnDefs: [

                                            { width: 150, targets: 3 },
                                            //{ visible: false, targets: 0 },

                                            ],

                                            buttons: [{
                                                extend: 'excel',
                                                text: 'Export to Excel',
                                                className: 'btn btn-warning',
                                                filename: 'MetricTargetApproval',
                                                exportOptions: { columns: [0, 1], modifier: { page: 'all' /*'current'*/ } }

                                            }]
                                        }).columns.adjust();

                                    };
                                    function Stages1()
                                    {
                                       // $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel4_rblStagesOrCheckList').change(function (e) {
                                            //debugger;
                                            var checked_radio = $("[id*=rblStagesOrCheckList] input:checked");
                                            var value = checked_radio.val();
                                            //alert(value);
                                            if (value == "SA") {
                                                //e.preventDefault();
                                                GetStages();

                                                $('#tblStage').show();
                                            }
                                       // })
                                    }
                                    function setStageIdandDesc(StageId, desc, Applicable,DisplayOrder) {
                                        //debugger;
                                        // alert(MetricWeightage);
                                        $('#hdnStageId').val(StageId);
                                      
                                        $('#txtDisplayOrder11').val(DisplayOrder);
                                        $('#txtMetricStage').val(desc);
                                        $('.rdapp').prop('checked', false);
                                        if (Applicable == 'B')
                                            Applicable='BO'
                                        $('#' + Applicable).prop("checked", true);
                                       
                                    }
                                    function setDocIdandDesc(Id, desc, Required, DocSource) {
                                        //debugger;
                                        // alert(MetricWeightage);
                                        $('#hdnDocId').val(Id);
                                        if (DocSource!="")
                                        $('#ddlDocSource').val(DocSource);
                                        $('#txtDocDesc').val(desc);
                                        if (Required == "Yes")
                                            $("#ddlchkOption1").val(1);
                                        else
                                            $("#ddlchkOption1").val(0);



                                    }
                                    function setDocId(Id, Active) {
                                        $('#hdnDocId').val(Id);
                                        // $('.ActiveChk').click(function () {
                                     

                                        // })

                                    }
                                    function ActiveDeactiveDocuments(Active) {
                                        var showmsg = "";
                                        if (Active == "1") {
                                            showmsg = "Are you sure to active this Document";
                                        }
                                        else {
                                            showmsg = "Are you sure to delete this Document";
                                        }
                                        swal({
                                            title: "Confirm Action",
                                            text: showmsg,
                                            closeOnConfirm: true,
                                            closeOnCancel: true,
                                            showCancelButton: true,
                                            confirmButtonText: "Yes",
                                            cancelButtonText: "No"

                                        },
              function (isConfirm) {
                  if (isConfirm) {

                      // var CheckListId = $('#hdnCheckListId').val();
                      var Reason = "";
                      if (Active == "0")
                          Reason = $('#txtReasonDocument').val();
                      else if (Active == "1")
                          Reason = $('#txtDocReasonActive').val();
                      var Id = $('#hdnDocId').val();
                      if (Reason != "") {
                     
                      $.ajax({
                          type: "POST",
                          url: "frmCriteriaMaster.aspx/DeleteDoc",
                          contentType: "application/json; charset=utf-8",
                          dataType: "json",
                          data: JSON.stringify({
                              Id: Id, IsActive: Active,Reason:Reason
                          }),
                          success: function (data) {
                              //debugger;
                              var msg = data.d;
                              if (msg == "Deactive successfuly" || msg == "Active successfuly") {
                                  setTimeout(function () {
                                      swal({ title: "", text: msg, type: "success" },
                                          function () {
                                              GetDocList();

                                          })
                                  }, 1000)
                              }
                              else
                                  alert(msg);

                          },
                          failure: function (response) {
                              alert(response.d);
                          },
                          error: function (response) {
                              alert(response.d);
                          }
                      })
                        }
                      else {
                         alert('Enter Reason');
                      }

                  }
              });
                                    }

                                    function setCheckListIdandDesc(CheckListId, desc, Required,DisplayOrder) {
                                        //debugger;
                                        // alert(MetricWeightage);
                                        $('#hdnCheckListId').val(CheckListId);

                                        $('#txtDisplayOrder1').val(DisplayOrder);
                                        $('#txtMetricCheckList').val(desc);
                                        if (Required == "Yes")
                                            $("#ddlchkOption").val(1);
                                        else
                                            $("#ddlchkOption").val(0);
                                        

                                    }
                                    function RenameStage() {
                                        $('#btnRenameStage').click(function (e) {
                                            var value = $("input[type=radio][name=StageApplicable]:checked").val();

                                            e.preventDefault();
                                            if (value != undefined) {
                                                swal({
                                                    title: "Confirm Rename",
                                                    text: "Are you sure to edit stage",
                                                    closeOnConfirm: true,
                                                    closeOnCancel: true,
                                                    showCancelButton: true,
                                                    confirmButtonText: "Yes",
                                                    cancelButtonText: "No"

                                                },
                   function (isConfirm) {
                       if (isConfirm) {
                           var Desc = $('#txtMetricStage').val();
                          
                           var StageId = $('#hdnStageId').val();
                           var DisplayOrder = $('#txtDisplayOrder11').val();
                           var Applicable = value;
                           if (Desc != "") {
                               $.ajax({
                                   type: "POST",
                                   url: "frmCriteriaMaster.aspx/RenameStages",
                                   contentType: "application/json; charset=utf-8",
                                   dataType: "json",
                                   data: JSON.stringify({
                                       StageId: StageId, Desc: Desc, Applicable: Applicable, DisplayOrder: DisplayOrder
                                   }),
                                   success: function (data) {
                                       //debugger;
                                       var msg = data.d;
                                       if (msg == "Update successfuly") {
                                           setTimeout(function () {
                                               swal({ title: "", text: msg, type: "success" },
                                                   function () {
                                                       GetStages();

                                                   })
                                           }, 1000)
                                       }
                                       else
                                           alert(msg);

                                   },
                                   failure: function (response) {
                                       alert(response.d);
                                   },
                                   error: function (response) {
                                       alert(response.d);
                                   }
                               })
                           }
                           else {
                               alert('Enter value in description');
                           }

                       }
                   });
                                            }
                                            else
                                                alert("Please select stage applicable");

                                        })
                                    }
                                    function RenameCheckList() {
                                        $('#btnRenameCheckList').click(function (e) {

                                            e.preventDefault();

                                            swal({
                                                title: "Confirm Rename",
                                                text: "Are you sure to edit checklist",
                                                closeOnConfirm: true,
                                                closeOnCancel: true,
                                                showCancelButton: true,
                                                confirmButtonText: "Yes",
                                                cancelButtonText: "No"

                                            },
               function (isConfirm) {
                   if (isConfirm) {
                       var Desc = $('#txtMetricCheckList').val();
                       var Req = $("#ddlchkOption option:selected").val();
                       var Order = $("#txtDisplayOrder1").val();

                       var CheckListId = $('#hdnCheckListId').val();

                       if (Desc != "") {
                           $.ajax({
                               type: "POST",
                               url: "frmCriteriaMaster.aspx/RenameCheckList",
                               contentType: "application/json; charset=utf-8",
                               dataType: "json",
                               data: JSON.stringify({
                                   CheckListId: CheckListId, Desc: Desc, Req: Req, DisplayOrder: Order
                               }),
                               success: function (data) {
                                   //debugger;
                                   var msg = data.d;
                                   if (msg == "Rename successfuly") {
                                       setTimeout(function () {
                                           swal({ title: "", text: msg, type: "success" },
                                               function () {
                                                   GetCheckList();

                                               })
                                       }, 1000)
                                   }
                                   else
                                       alert(msg);

                               },
                               failure: function (response) {
                                   alert(response.d);
                               },
                               error: function (response) {
                                   alert(response.d);
                               }
                           })
                       }
                       else {
                           alert('Enter value in description');
                       }

                   }
               });


                                        })
                                    }
                                    function DeleteStage() {
                                        $('#btnStageDelete').click(function (e) {
                                            e.preventDefault();
                                            swal({
                                                title: "Confirm Delete",
                                                text: "Are you sure to delete this Stage",
                                                closeOnConfirm: true,
                                                closeOnCancel: true,
                                                showCancelButton: true,
                                                confirmButtonText: "Yes",
                                                cancelButtonText: "No"

                                            },
               function (isConfirm) {
                   if (isConfirm) {
                       var Reason = $('#txtReasonStage').val();
                       var StageId = $('#hdnStageId').val();
                       if (Reason != "") {
                           $.ajax({
                               type: "POST",
                               url: "frmCriteriaMaster.aspx/DeleteStage",
                               contentType: "application/json; charset=utf-8",
                               dataType: "json",
                               data: JSON.stringify({
                                   StageId: StageId, Reason: Reason, IsActive: 0
                               }),
                               success: function (data) {
                                   //debugger;
                                   var msg = data.d;
                                   if (msg == "Deactive successfuly") {
                                       setTimeout(function () {
                                           swal({ title: "", text: msg, type: "success" },
                                               function () {
                                                   GetStages();

                                               })
                                       }, 1000)
                                   }
                                   else
                                       alert(msg);

                               },
                               failure: function (response) {
                                   alert(response.d);
                               },
                               error: function (response) {
                                   alert(response.d);
                               }
                           })
                       }
                       else {
                           alert('Enter Reason');
                       }

                   }
               });
                                        })
                                    }
                                    function ActiveCheckList(Active)
                                    {

                                        //debugger;
                                        var showmsg = "";
                                        
                                        Reason = "";
                                        if (Active == "1") {
                                            showmsg = "Are you sure to active this checklist";
                                            Reason = $('#txtReasonChecklist').val();
                                        }
                                        else {
                                            showmsg = "Are you sure to delete this checklist";
                                            Reason = $('#txtReasonforDeactive').val();
                                        }
                                        swal({
                                            title: "Confirm Delete",
                                            text: showmsg,
                                            closeOnConfirm: true,
                                            closeOnCancel: true,
                                            showCancelButton: true,
                                            confirmButtonText: "Yes",
                                            cancelButtonText: "No"

                                        },
                                       function (isConfirm) {
                                           if (isConfirm) {

                                                var Id = $('#hdnCheckListId').val();
                                               if (Reason != "") {
                                                   $.ajax({
                                                       type: "POST",
                                                       url: "frmCriteriaMaster.aspx/DeleteCheckList",
                                                       contentType: "application/json; charset=utf-8",
                                                       dataType: "json",
                                                       data: JSON.stringify({
                                                           CheckListId: Id, IsActive: Active,Reason:Reason
                                                       }),
                                                       success: function (data) {
                                                           //debugger;
                                                           var msg = data.d;
                                                           if (msg == "Deactive successfuly" || msg == "Active successfuly") {
                                                               setTimeout(function () {
                                                                   swal({ title: "", text: msg, type: "success" },
                                                                       function () {
                                                                           GetCheckList();

                                                                       })
                                                               }, 1000)
                                                           }
                                                           else
                                                               alert(msg);

                                                       },
                                                       failure: function (response) {
                                                           alert(response.d);
                                                       },
                                                       error: function (response) {
                                                           alert(response.d);
                                                       }
                                                   })
                                               }
                                              
                                           }
                                       });

                                    }
                                    function ActiveStage() {
                                        $('#btnActiveStage').click(function (e) {
                                            e.preventDefault();
                                            swal({
                                                title: "Confirm Active",
                                                text: "Are you sure to active this stage",
                                                closeOnConfirm: true,
                                                closeOnCancel: true,
                                                showCancelButton: true,
                                                confirmButtonText: "Yes",
                                                cancelButtonText: "No"

                                            },
               function (isConfirm) {
                   if (isConfirm) {
                       var Reason = $('#txtStageReasonActive').val();
                       var StageId = $('#hdnStageId').val();
                       if (Reason != "") {
                           $.ajax({
                               type: "POST",
                               url: "frmCriteriaMaster.aspx/DeleteStage",
                               contentType: "application/json; charset=utf-8",
                               dataType: "json",
                               data: JSON.stringify({
                                   StageId: StageId, Reason: Reason, IsActive: 1
                               }),
                               success: function (data) {
                                   //debugger;
                                   var msg = data.d;
                                   if (msg == "Active successfuly") {
                                       setTimeout(function () {
                                           swal({ title: "", text: msg, type: "success" },
                                               function () {
                                                   GetStages();

                                               })
                                       }, 1000)
                                   }
                                   else
                                       alert(msg);

                               },
                               failure: function (response) {
                                   alert(response.d);
                               },
                               error: function (response) {
                                   alert(response.d);
                               }
                           })
                       }
                       else {
                           alert('Enter Reason');
                       }

                   }
               });
                                        })
                                    }
                                    function DocList() {
                                        // $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel4_rblStagesOrCheckList').change(function (e) {
                                        if ($('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel4_rbtnLstDocumentType input:checked').val() == "V") {
                                            // alert('infn');
                                            // e.preventDefault();
                                            GetDocList();

                                            $('#tblDocList').show();
                                        }

                                        //})
                                    }
                                    function GetDocList() {
                                        //debugger;
                                        // alert('metric');
                                        if ($.fn.DataTable.isDataTable('#tblDocList')) {
                                            $('#tblDocList').DataTable().destroy();
                                        }
                                        var MetricId = $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel4_ddlStageMetric').val();
                                        // alert(Indicator);
                                        if (MetricId != null && MetricId != 'Select') {
                                            $.ajax({
                                                type: "POST",
                                                url: "frmCriteriaMaster.aspx/GetMetricDoc",
                                                data: JSON.stringify({
                                                    MetricId: MetricId
                                                }),
                                                contentType: "application/json; charset=utf-8",
                                                dataType: "json",
                                                success: OnSuccessDocList,
                                                failure: function (response) {
                                                    alert(response.d);
                                                },
                                                error: function (response) {
                                                    alert(response.d);
                                                },
                                                complete: function () {
                                                }

                                            });
                                        }
                                    }
                                    function OnSuccessDocList(response) {
                                        //debugger;
                                        $("#tblDocList").DataTable(
                                        {
                                            dom: 'Bfrtip',
                                            bLengthChange: true,
                                            lengthMenu: [[50, 100, -1], [50, 100, "All"]],
                                            bFilter: true,
                                            bSort: true,
                                            bPaginate: true,
                                            data: response.d,

                                            columns: [{ "data": "Id" },
                                                { "data": "Desc" },
                                               { "data": "DocSource" },
                                               { "data": "IsReq" },
                                               {
                                                   "data": "IsActive",
                                                   "render": function (data, type, row, meta) {
                                                       if (type === 'display') {
                                                           if (row.IsActive == true)
                                                               data = '<a href="javascript:void(0)" class="btn btn-sm btn-warning ActiveDoc" data-target="#DocumentModal" data-backdrop="static" data-keyboard="false" data-toggle="modal" onclick="setDocId(' + "'" + row.Id + "'," + "'0'" + ')"  data-backdrop="static" data-keyboard="false">Deactive</a> <a href="javascript:void(0)" class="btn btn-sm btn-info" data-toggle="modal" onclick="setDocIdandDesc(' + "'" + row.Id + "'," + "'" + row.Desc.replace(/\s{2,}/g, ' ').trim().replace(/\r/g, "").replace(/\n/g, "").replace(/'/g, "") + "'," + "'" + row.IsReq + "'," + "'" + row.DocSource + "'" + ')" data-target="#RenameDocModal"  data-backdrop="static" data-keyboard="false">Edit</a>'
                                                           else
                                                               data = '<a href="javascript:void(0)" class="btn btn-sm btn-danger ActiveDoc" data-target="#DocumentModalActive" data-backdrop="static" data-keyboard="false" data-toggle="modal" onclick="setDocId(' + "'" + row.Id + "'," + "'1'" + ')"   data-backdrop="static" data-keyboard="false">Active</a> '

                                                       }



                                                       return data;
                                                   }
                                               }

                                            ],
                                            columnDefs: [

                                            { width: 150, targets: 3 },
                                            //{ visible: false, targets: 0 },

                                            ],

                                            buttons: [{
                                                extend: 'excel',
                                                text: 'Export to Excel',
                                                className: 'btn btn-warning',
                                                filename: 'MetricDoc',
                                                exportOptions: { columns: [2, 3, 3, 5], modifier: { page: 'all' /*'current'*/ } }

                                            }]
                                        }).columns.adjust();

                                    };
                                    function RenameDocList() {
                                        $('#btnRenameDoc').click(function (e) {

                                            e.preventDefault();

                                            swal({
                                                title: "Confirm edit",
                                                text: "Are you sure to edit document",
                                                closeOnConfirm: true,
                                                closeOnCancel: true,
                                                showCancelButton: true,
                                                confirmButtonText: "Yes",
                                                cancelButtonText: "No"

                                            },
               function (isConfirm) {
                   if (isConfirm) {
                       var Desc = $('#txtDocDesc').val();
                       var Req = $("#ddlchkOption1 option:selected").val();
                       var Source = $("#ddlDocSource option:selected").val();
                       var Order = $("#txtDisplayOrder1").val();
                       var DocId = $('#hdnDocId').val();

                       if (Desc != "") {
                           $.ajax({
                               type: "POST",
                               url: "frmCriteriaMaster.aspx/RenameDocListofVerification",
                               contentType: "application/json; charset=utf-8",
                               dataType: "json",
                               data: JSON.stringify({
                                   Id: DocId, Desc: Desc, Req: Req, Docsource: Source
                               }),
                               success: function (data) {
                                   //debugger;
                                   var msg = data.d;
                                   if (msg == "Rename successfuly") {
                                       setTimeout(function () {
                                           swal({ title: "", text: msg, type: "success" },
                                               function () {
                                                   GetDocList();

                                               })
                                       }, 1000)
                                   }
                                   else
                                       alert(msg);

                               },
                               failure: function (response) {
                                   alert(response.d);
                               },
                               error: function (response) {
                                   alert(response.d);
                               }
                           })
                       }
                       else {
                           alert('Enter value in description');
                       }

                   }
               });


                                        })
                                    }
                                    function setDocListIdandDesc(Id, desc, Required, DocSource) {
                                        //debugger;
                                        // alert(MetricWeightage);
                                        $('#hdnDocId').val(Id);

                                        $('#ddlDocSource').val(DocSource);
                                        $('#txtDocDesc').val(desc);
                                        if (Required == "Yes")
                                            $("#ddlchkOption1").val(1);
                                        else
                                            $("#ddlchkOption1").val(0);



                                    }

                                   							
                                 </script>
                             <script type="text/javascript" language="javascript">
                                 Sys.Application.add_load(Stages);
                                 Sys.Application.add_load(CheckList);
                                 Sys.Application.add_load(DocList);
                                        Sys.Application.add_load(setStageId);
                                        Sys.Application.add_load(setStageIdandDesc);
                                        Sys.Application.add_load(RenameStage);
                                        Sys.Application.add_load(DeleteStage);
                                        Sys.Application.add_load(ActiveStage);
                                        //Sys.Application.add_load(setCheckListId);
                                        Sys.Application.add_load(setCheckListIdandDesc);
                                        Sys.Application.add_load(RenameDocList);
                                        Sys.Application.add_load(RenameCheckList);
                                        Sys.Application.add_load(Stages1);
                                        Sys.Application.add_load(setDocListIdandDesc);
                                        //Sys.Application.add_load(ActiveCheckList);
                                 </script>
                            <asp:UpdatePanel ID="UpdatePanel4" runat="server">
                                <ContentTemplate>
                                    <table align="center" bgcolor="#cccccc" border="0" cellpadding="1" cellspacing="1" width="100%">
                                        <tr>
                                            <td align="right" class="input_form_caption_td">
                                                <asp:LinkButton ID="lnkExportStages" runat="server" OnClick="lnkExportStages_Click" Visible="False">Download Data</asp:LinkButton>
                                                &nbsp;<asp:HyperLink ID="HyperLink4" runat="server" NavigateUrl="~/Forms/StrategicStages/Stages Master.xls" Target="_blank">Download Format</asp:HyperLink>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" class="input_form_caption_td">
                                                <table align="center" bgcolor="#cccccc" border="0" cellpadding="1" cellspacing="1" width="100%">
                                                    <%-- <tr>
                                                        <td class="input_form_caption_td" style="width: 20%;">
                                                            <asp:Label ID="Label2428" runat="server" Text="Session :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlSessionStages" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlSessionStages_SelectedIndexChanged" OnDataBound="ddlSessionStages_DataBound" Width="250px"></asp:DropDownList><asp:RequiredFieldValidator ID="RequiredFieldValidator18" ForeColor="Red" runat="server" ControlToValidate="ddlSessionStages" ErrorMessage="Please select session" InitialValue="Select" ValidationGroup="stages">*</asp:RequiredFieldValidator></td>
                                                    </tr>--%>
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label2429" runat="server" Text="Division :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlDivisionStages" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlDivisionStages_SelectedIndexChanged" OnDataBound="ddlDivisionStages_DataBound" Width="250px"></asp:DropDownList>
                                                            <asp:RequiredFieldValidator ID="RequiredFieldValidator19" runat="server" ControlToValidate="ddlDivisionStages" ErrorMessage="Please select division" InitialValue="Select" ForeColor="Red" ValidationGroup="stages">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label2430" runat="server" Text="Criteria :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlCriteriaStages" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlCriteriaStages_SelectedIndexChanged" OnDataBound="ddlCriteriaStages_DataBound" Width="250px"></asp:DropDownList><asp:RequiredFieldValidator ID="RequiredFieldValidator20" ForeColor="Red" runat="server" ControlToValidate="ddlCriteriaStages" ErrorMessage="Please select criteria" InitialValue="Select" ValidationGroup="stages">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label2431" runat="server" Text="Key Indicator :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlKiStages" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlKiStages_SelectedIndexChanged" OnDataBound="ddlKiStages_DataBound" Width="250px"></asp:DropDownList><asp:RequiredFieldValidator ID="RequiredFieldValidator21" runat="server" ForeColor="Red" ControlToValidate="ddlKiStages" ErrorMessage="Please select key indicator" InitialValue="Select" ValidationGroup="stages">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label2438" runat="server" Text="Metric :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlStageMetric" runat="server" OnDataBound="ddlStageMetric_DataBound" Width="250px" ></asp:DropDownList><asp:RequiredFieldValidator ID="RequiredFieldValidator24" runat="server" ForeColor="Red" ControlToValidate="ddlStageMetric" ErrorMessage="Please select Metric" InitialValue="Select" ValidationGroup="stages">*</asp:RequiredFieldValidator></td>
                                                        <%--AutoPostBack="True" OnSelectedIndexChanged="ddlStageMetric_SelectedIndexChanged"--%>
                                                    </tr>
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label8" runat="server" Text="Option :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:RadioButtonList ID="rblStagesOrCheckList" runat="server" AutoPostBack="True" OnSelectedIndexChanged="rblStagesOrCheckList_SelectedIndexChanged" RepeatDirection="Horizontal" RepeatLayout="Flow">
                                                                <asp:ListItem Selected="True" Value="SA">Metric Stages</asp:ListItem>
                                                                <asp:ListItem Value="MC">Metric Check List</asp:ListItem>
                                                                <asp:ListItem Value="SC" Enabled="False">Stages Check List</asp:ListItem>
                                                                <asp:ListItem Value="DC">Metric Documents</asp:ListItem>
                                                            </asp:RadioButtonList>
                                                            <asp:RequiredFieldValidator ID="RequiredFieldValidator31" runat="server" ControlToValidate="rblStagesOrCheckList" ErrorMessage="Please select option" ForeColor="Red" ValidationGroup="stages">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr id="DocumentsTypeList" runat="server" visible="false">
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label10" runat="server" Text="Documents Type :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:RadioButtonList ID="rbtnLstDocumentType" runat="server" RepeatDirection="Horizontal" AutoPostBack="True" RepeatLayout="Flow" OnSelectedIndexChanged="rbtnLstDocumentType_SelectedIndexChanged">
                                                                <asp:ListItem Value="V">Document of Verification</asp:ListItem>
                                                                <asp:ListItem Value="G">Document of GuideLines</asp:ListItem>
                                                                <asp:ListItem Value="P">Document of Process</asp:ListItem>
                                                                <asp:ListItem Value="F">Document of Format(Template)</asp:ListItem>
                                                                <asp:ListItem Value="N">Not to be Included</asp:ListItem>
                                                                <asp:ListItem Value="I">Document of Incentive</asp:ListItem>
                                                            </asp:RadioButtonList><asp:RequiredFieldValidator ID="rFVrbtnLstDocumentType" runat="server" ForeColor="Red" ControlToValidate="rbtnLstDocumentType" ErrorMessage="Please select Document Type" ValidationGroup="stages">*</asp:RequiredFieldValidator>

                                                        </td>
                                                    </tr>
                                                    <tr id="DownloadUploadedDocList" runat="server" visible="false">
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label11" runat="server" Text="Document / List :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <%--<asp:DataList ID="dluploadedMetricDocList" Visible="false" runat="server" ShowFooter="false" ShowHeader="false" CellPadding="0" RepeatColumns="5" RepeatDirection="Horizontal">
                                                                         <ItemTemplate>    
                                                                                    <td ><%#Eval("DocumentDescription")%></td> 
                                                                        </ItemTemplate>  
                                                                     </asp:DataList>--%>
                                                            <asp:CheckBoxList ID="dluploadedMetricDocList" Visible="false" runat="server" RepeatDirection="Horizontal" RepeatColumns="5"></asp:CheckBoxList>

                                                            <asp:LinkButton ID="hlinkUploadedMetricDocuments" runat="server" Visible="false" CausesValidation="False" Font-Bold="True" Font-Underline="True" ForeColor="DarkGreen" Font-Size="Small" OnClientClick="func_btnClick(event);">Download Metric Documents</asp:LinkButton>
                                                            <asp:Label ID="lblDocumentNotAvailable" runat="server" ForeColor="Red" Text="NA" Visible="false"></asp:Label>

                                                        </td>
                                                    </tr>

                                                    <tr id="TRStagesList" runat="server" visible="false">
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label2441" runat="server" Text="Stages :"></asp:Label>
                                                        </td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlStageList" runat="server" Width="250px" OnDataBound="ddlStageList_DataBound">
                                                            </asp:DropDownList>
                                                            <asp:RequiredFieldValidator ID="RequiredFieldValidator32" runat="server" ControlToValidate="ddlStageList" ErrorMessage="Please select stages" InitialValue="Select" ValidationGroup="stages">*</asp:RequiredFieldValidator>
                                                        </td>
                                                    </tr>
                                                    <tr runat="server" id="singlemultiple">
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label2432" runat="server" Text="Upload Category :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:RadioButtonList ID="rblStagesOptions" runat="server" AutoPostBack="True" OnSelectedIndexChanged="rblStagesOptions_SelectedIndexChanged" RepeatDirection="Horizontal" RepeatLayout="Flow">
                                                                <asp:ListItem Value="S">Single Entry</asp:ListItem>
                                                                <asp:ListItem Value="M">Multiple Entries</asp:ListItem>
                                                            </asp:RadioButtonList><asp:RequiredFieldValidator ID="RequiredFieldValidator22" runat="server" ControlToValidate="rblStagesOptions" ErrorMessage="Please select upload category" ValidationGroup="stages">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr id="TRStagesSingle" runat="server" visible="False">
                                                        <td runat="server" class="input_form_caption_td">
                                                            <asp:Label ID="lblstagDescription" runat="server" Text="Stage description :"></asp:Label>
                                                            <asp:Label ID="lblDocuDescription" runat="server" Visible="false" Text="Document description :(Maximum Length allowed is 500 characters)"></asp:Label></td>
                                                        <td runat="server" class="input_form_caption_td">
                                                            <asp:TextBox ID="txtStages" runat="server" TextMode="MultiLine" Width="250px"></asp:TextBox><asp:RequiredFieldValidator ID="RequiredFieldValidator23" ForeColor="Red" runat="server" ControlToValidate="txtStages" ErrorMessage="Please enter Stages descriptions" ValidationGroup="stages">*</asp:RequiredFieldValidator>
                                                            <asp:TextBox ID="txtDocmentDesc" Visible="false" runat="server" TextMode="MultiLine" Width="250px"></asp:TextBox><asp:RequiredFieldValidator ID="RequiredFieldValidator34" ForeColor="Red" runat="server" ControlToValidate="txtDocmentDesc" ErrorMessage="Please enter Document description" ValidationGroup="stages">*</asp:RequiredFieldValidator>
                                                            <asp:RegularExpressionValidator runat="server" ID="rEVtxtDocmentDesc" ForeColor="Red"
                                                                ControlToValidate="txtDocmentDesc" ValidationGroup="stages"
                                                                ValidationExpression="^[\s\S]{0,500}$"
                                                                ErrorMessage="Description can be of maximum of 500 characters"
                                                                Display="Dynamic">*</asp:RegularExpressionValidator>
                                                        </td>
                                                    </tr>
                                                    <tr id ="trDocSource" runat="server" visible="false">
                                                        <td class="input_form_caption_td"><asp:Label ID="Label4" runat="server" Text="Primary Responsibility :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                             <asp:RadioButtonList ID="rdlSource" runat="server" AutoPostBack="True"  RepeatDirection="Horizontal" RepeatLayout="Flow">
                                                                <asp:ListItem Value="E" Selected="True">End User</asp:ListItem>
                                                                <asp:ListItem Value="S">Source Division</asp:ListItem>
                                                                 <asp:ListItem Value="B">Both</asp:ListItem>
                                                            </asp:RadioButtonList>
                                                        </td>
                                                    </tr>
                                      
                                                    <tr id="trReq" runat="server" visible="false">
                                                        <td class="input_form_caption_td"><asp:Label ID="Label5" runat="server" Text="Madatory/Optional :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:RadioButtonList ID="rdlIsReq" runat="server" AutoPostBack="True"  RepeatDirection="Horizontal" RepeatLayout="Flow">
                                                                <asp:ListItem Value="1" Selected="True">Required</asp:ListItem>
                                                                <asp:ListItem Value="0">Optional</asp:ListItem>
                                                                
                                                            </asp:RadioButtonList>
                                                        </td>
                                                    </tr>
                                                    <tr id="TRStagesSingle3" runat="server" visible="False">
                                                        <td runat="server" class="input_form_caption_td">
                                                            <asp:Label ID="Label7" runat="server" Text="Applicable To :"></asp:Label></td>
                                                        <td runat="server" class="input_form_caption_td">
                                                            <asp:RadioButtonList ID="rblApplicable" runat="server" AutoPostBack="True" OnSelectedIndexChanged="rblStagesOptions_SelectedIndexChanged" RepeatDirection="Horizontal" RepeatLayout="Flow">
                                                                <asp:ListItem Value="D">Division</asp:ListItem>
                                                                <asp:ListItem Value="S">School</asp:ListItem>
                                                                <asp:ListItem Selected="True" Value="B">Both</asp:ListItem>
                                                                 <asp:ListItem  Value="O">Other Division</asp:ListItem>
                                                            </asp:RadioButtonList>
                                                            <asp:RequiredFieldValidator ID="RequiredFieldValidator30" runat="server" ControlToValidate="rblApplicable" ErrorMessage="Please select applicable to" ValidationGroup="stages">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr id="TRStagesSingle1" runat="server" visible="False">
                                                        <td runat="server" class="input_form_caption_td">
                                                            <asp:Label ID="Label6" runat="server" Text="Display Order :"></asp:Label></td>
                                                        <td runat="server" class="input_form_caption_td">
                                                            <asp:TextBox ID="txtDisplayOrder" runat="server" Width="250px" onkeypress="return isNumberKey(event)"></asp:TextBox><asp:RequiredFieldValidator ID="RequiredFieldValidator29" runat="server" ControlToValidate="txtDisplayOrder" ErrorMessage="Please enter display order" ValidationGroup="stages">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr id="TRRequired" runat="server" visible="False">
                                                        <td runat="server" class="input_form_caption_td">
                                                            <asp:Label ID="Label9" runat="server" Text="Required :"></asp:Label></td>
                                                        <td runat="server" class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlRequired" runat="server">
                                                                <asp:ListItem Value="Select">Select</asp:ListItem>
                                                                <asp:ListItem Value="1">Yes</asp:ListItem>
                                                                <asp:ListItem Value="0">No</asp:ListItem>
                                                            </asp:DropDownList>
                                                            <asp:RequiredFieldValidator ID="RequiredFieldValidator33" runat="server" ControlToValidate="ddlRequired" ErrorMessage="Please select required" ValidationGroup="stages" InitialValue="Select">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr id="TR1" runat="server" visible="False">
                                                        <td runat="server" class="input_form_caption_td">
                                                            <asp:Label ID="Label14" runat="server" Text="Document/Template Title :"></asp:Label></td>
                                                        <td runat="server" class="input_form_caption_td">
                                                            <asp:TextBox ID="txtTitle" runat="server"></asp:TextBox>
                                                            <asp:RequiredFieldValidator ID="rFVTitleDocumentFormat" runat="server" ControlToValidate="txtTitle" Enabled="false" ErrorMessage="Please enter title of template" ValidationGroup="stages">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr id="TRStagesMultiple" runat="server" visible="False">
                                                        <td runat="server" class="input_form_caption_td">
                                                            <asp:Label ID="Label2437" runat="server" Text="Upload File :"></asp:Label><asp:Label ID="lblnote" runat="server" Visible="false">Only pdf,xls and zip</asp:Label></td>
                                                        <td runat="server" class="input_form_caption_td">
                                                            <asp:FileUpload ID="fuStagesUpload" runat="server" Width="250px" />
                                                            <asp:RequiredFieldValidator ID="rFVfuStagesUpload" Enabled="false" ForeColor="Red" runat="server" ControlToValidate="fuStagesUpload" ErrorMessage="Please select file to upload" ValidationGroup="stages">*</asp:RequiredFieldValidator>
                                                            <asp:FileUpload ID="fuPDFDocument" runat="server" Width="250px" Visible="false" onChange="validateFile(this.value)" />
                                                            <asp:RequiredFieldValidator ID="rFVfuPDFDocument" ForeColor="Red" runat="server" Visible="false" ControlToValidate="fuPDFDocument" ErrorMessage="Please select document to upload" ValidationGroup="stages">*</asp:RequiredFieldValidator>

                                                            <asp:Button ID="btnStagesUpload" runat="server" OnClick="btnStagesUpload_Click" Height="30px" Width="100px" Text="Upload" ValidationGroup="stages" />
                                                            <asp:HyperLink ID="hLnkMetricDocumentFormat" Visible="false" Style="float: right;" runat="server" NavigateUrl="~/Forms/StrategicStages/MetricDocuments.xls" Target="_blank">Download Metric Document Format</asp:HyperLink>
                                                             <asp:HyperLink ID="hLnkMetricStageFormat" Visible="false" Style="float: right;" runat="server" NavigateUrl="~/Forms/StrategicStages/MetricStages.xls" Target="_blank">Download Metric Stage Format</asp:HyperLink>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr id="TRStagesOfflinePnl" runat="server" visible="False">
                                            <td runat="server" align="center" class="input_form_caption_td">
                                                <asp:Panel ID="Panel5" runat="server" Height="200px" ScrollBars="Both">
                                                    <asp:GridView ID="grdStagesUpload" runat="server" AutoGenerateColumns="False" CellPadding="1" CellSpacing="1" Width="100%">
                                                        <Columns>
                                                            <asp:TemplateField HeaderText="Stage Description" SortExpression="StageDescription">
                                                                <EditItemTemplate>
                                                                    <asp:TextBox ID="TextBox1" runat="server" Text='<%# Bind("StageDescription") %>'></asp:TextBox>
                                                                </EditItemTemplate>
                                                                <ItemTemplate>
                                                                    <asp:Label ID="lblStages" runat="server" Text='<%# Bind("StageDescription") %>'></asp:Label>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                            <asp:TemplateField HeaderText="Display Order" SortExpression="DisplayOrder">
                                                                <EditItemTemplate>
                                                                    <asp:TextBox ID="TextBox2" runat="server" Text='<%# Bind("DisplayOrder") %>'></asp:TextBox>
                                                                </EditItemTemplate>
                                                                <ItemTemplate>
                                                                    <asp:Label ID="lblDisplayOrder" runat="server" Text='<%# Bind("DisplayOrder") %>'></asp:Label>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                            <asp:TemplateField HeaderText="Applicable To" SortExpression="ApplicableTo">
                                                                <EditItemTemplate>
                                                                    <asp:TextBox ID="TextBox3" runat="server" Text='<%# Bind("ApplicableTo") %>'></asp:TextBox>
                                                                </EditItemTemplate>
                                                                <ItemTemplate>
                                                                    <asp:Label ID="lblApplicableTo" runat="server" Text='<%# Bind("ApplicableTo") %>'></asp:Label>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                        </Columns>
                                                    </asp:GridView>
                                                </asp:Panel>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" class="input_form_caption_td">
                                                <asp:Button ID="btnSaveStages" runat="server" Height="30px" Width="100px" OnClick="btnSaveStages_Click" Text="Submit" ValidationGroup="stages" Visible="False" />
                                                <asp:Button ID="btnResetStages" runat="server" Height="30px" Width="100px" CausesValidation="False" OnClick="btnResetStages_Click" Text="Reset" />
                                                <asp:ValidationSummary ID="ValidationSummary5" runat="server" ShowMessageBox="True" ShowSummary="False" ValidationGroup="stages" />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" class="input_form_caption_td">
                                                <asp:Label ID="lblError2" runat="server" ForeColor="Red"></asp:Label>
                                            </td>
                                        </tr>
                                    </table>
                                    <asp:HiddenField ID="hdnDeletefiles" runat="server" Visible="false" />
                                    <asp:HiddenField ID="hdnReferenceDocUpdate" runat="server"></asp:HiddenField>
                                    <asp:HiddenField ID="hdnFilePath" runat="server"></asp:HiddenField>
                                      <table id="tblStage" class="table" style="display: none; width: 100%">
                                        <thead>
                                            <tr>
                                                <th>Id</th>
                                                <th>Description</th>
                                                <th>AppicableTo</th>
                                               <th>Display Order</th>
                                                <th>Deactive/Edit Stage </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        </tbody>
                                    </table>
                                        <table id="tblCheckList" class="table" style="display: none; width: 100%">
                                        <thead>
                                            <tr>
                                                <th>Id</th>
                                                <th>Description</th>
												<th>Display order</th>
                                                <th>Required</th>
                                                <th>Deactive/Edit CheckList </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        </tbody>
                                    </table>
                                    <table id="tblDocList" class="table" style="display: none; width: 100%">
                                        <thead>
                                            <tr>
                                                <th>Id</th>
                                                <th>Description</th>
												<th>Primary Responsibility</th>
                                                <th>Required</th>
                                                <th>Deactive/Edit Doc </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        </tbody>
                                    </table>
                                    <input type="hidden" id="hdnStageId" value="0" />
                                    <input type="hidden" id="hdnStageDesc" value="0" />
                                    <input type="hidden" id="hdnCheckListId" value="0" />
                                    <input type="hidden" id="hdnCheckListDesc" value="0" />
                                     <input type="hidden" id="hdnDocId" value="0" />
                                    <input type="hidden" id="hdnDocDesc" value="0" />
                                     <!-- Modal -->
                                    <div class="modal fade" id="StageModal" tabindex="-1" role="dialog" aria-labelledby="StageModalLabel" aria-hidden="true">
                                        <div class="modal-dialog" role="document">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="StageModalLabel">Deactive Metric</h5>
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div class="modal-body">
                                                    <label>Enter Reason </label>
                                                    <input type="text" id="txtReasonStage" class="form-control" />
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-primary btn-sm" id="btnStageDelete" >Save changes</button>
                                                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="modal fade" id="RenameStageModal" tabindex="-1" role="dialog" aria-labelledby="RenameStageModalLabel" aria-hidden="true">
                                        <div class="modal-dialog" role="document">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="RenameStageModalLabel">Edit Stage</h5>
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div class="modal-body">
                                                    <div class="form-group">
                                                        <label>Stage Description</label>
                                                        <textarea class="form-control" rows="2" name="txtMetricStage" id="txtMetricStage"></textarea>
                                                    </div>
                                                    <div>
                                                        <label>Stage Applicable</label>
                                                        <br />
                                                        <label>
                                                            <input type="radio" id="D" class="rdapp" name="StageApplicable" value="D">
                                                            Division
                                                        </label>

                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input type="radio" id="S" name="StageApplicable" value="S" class="rdapp">
                                                            School
                                                        </label>

                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input type="radio" id="BO" name="StageApplicable" value="B" class="rdapp">
                                                            Both
                                                        </label>

                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input type="radio" id="O" name="StageApplicable" value="O" class="rdapp">
                                                            Other division
                                                        </label>
                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
                                                       <div >
                                                            <label>Stage Display Order</label>
                                                        <br />
                                                        <label>
                                                            <input type="number" min="1" id="txtDisplayOrder11" class="form-control" >

                                                        </label>
                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-primary btn-sm" id="btnRenameStage">Save changes</button>
                                                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                           <div class="modal fade" id="ChklstModalDe" tabindex="-1" role="dialog" aria-labelledby="ChklstModalDeLabel" aria-hidden="true">
                                        <div class="modal-dialog" role="document">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="ChklstModalDeLabel">Deactive CheckList</h5>
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div class="modal-body">
                                                    <label>Enter Reason </label>
                                                    <input type="text" id="txtReasonforDeactive" class="form-control" />
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-primary btn-sm" onclick="ActiveCheckList('0')"   >Save changes</button>
                                                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                     <div class="modal fade" id="StageModalActive" tabindex="-1" role="dialog" aria-labelledby="StageModalLabelActive" aria-hidden="true">
                                        <div class="modal-dialog" role="document">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="StageModalLabelActive">Active Stage</h5>
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div class="modal-body">
                                                    <label>Enter Reason </label>
                                                    <input type="text" id="txtStageReasonActive" class="form-control" />
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-primary btn-sm" id="btnActiveStage">Save changes</button>
                                                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                        <div class="modal fade" id="RenameDocModal" tabindex="-1" role="dialog" aria-labelledby="RenameDocModalLabel" aria-hidden="true">
                                        <div class="modal-dialog" role="document">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="RenameDocModalLabel">Edit Document</h5>
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div class="modal-body">
                                                      <div class="form-group ">
                                                        <label>Document Description</label>
                                                        <input class="form-control" rows="2" name="txtDocDesc" id="txtDocDesc">
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-lg-6">
                                                            <label>Primary Responsibility</label>
                                                            <br />
                                                        <select id="ddlDocSource" class="form-control">
                                                            <option value="S">Source Division</option>
                                                            <option value="E">End User</option>
															  <option value="B">Both</option>
                                                        </select>
                                                        </div>
                                                        <div class="col-lg-6">
                                                            <label>Required</label>
                                                            <br />
                                                        <select id="ddlchkOption1" class="form-control">
                                                            <option value="1">Mandatory</option>
                                                            <option value="0">Optional</option>
                                                        </select>
                                                        </div>
                                                    </div>
                                                  
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-primary btn-sm" id="btnRenameDoc">Save changes</button>
                                                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                                <div class="modal fade" id="DocumentModal" tabindex="-1" role="dialog" aria-labelledby="DocumentModalLabel" aria-hidden="true">
                                        <div class="modal-dialog" role="document">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="DocumentModalLabel">Deactive Document</h5>
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div class="modal-body">
                                                    <label>Enter Reason </label>
                                                    <input type="text" id="txtReasonDocument" class="form-control" />
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-primary btn-sm" id="btnDocumentDelete" onclick="ActiveDeactiveDocuments('0');">Save changes</button>
                                                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                          <div class="modal fade" id="DocumentModalActive" tabindex="-1" role="dialog" aria-labelledby="DocumentModalLabelActive" aria-hidden="true">
                                        <div class="modal-dialog" role="document">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="DocumentModalLabelActive">Active Stage</h5>
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div class="modal-body">
                                                    <label>Enter Reason </label>
                                                    <input type="text" id="txtDocReasonActive" class="form-control" />
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-primary btn-sm" id="btnActiveDoc" onclick="ActiveDeactiveDocuments('1');">Save changes</button>
                                                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                         <div class="modal fade" id="ChklstActiveModal" tabindex="-1" role="dialog" aria-labelledby="ChklstActiveModalLabel" aria-hidden="true">
                                        <div class="modal-dialog" role="document">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="ChklstActiveModalLabel">Active Checklist</h5>
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div class="modal-body">
                                                    <label>Enter Reason </label>
                                                    <input type="text" id="txtReasonChecklist" class="form-control" />
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-primary btn-sm" id="btnChecklistDelete" onclick="ActiveCheckList('1')" >Save changes</button>
                                                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <%--  <div class="modal fade" id="CheckListModal" tabindex="-1" role="dialog" aria-labelledby="CheckListModalLabel" aria-hidden="true">
                                        <div class="modal-dialog" role="document">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="CheckListModalLabel">Deactive CheckList</h5>
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div class="modal-body">
                                                    <label>Enter Reason </label>
                                                    <input type="text" id="txtReasonChecklist" class="form-control" />
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-primary btn-sm" id="btnChklstDelete">Save changes</button>
                                                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>--%>
                                    <div class="modal fade" id="RenameCheckListModal" tabindex="-1" role="dialog" aria-labelledby="RenameCheckListModalLabel" aria-hidden="true">
                                        <div class="modal-dialog" role="document">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="RenameCheckListModalLabel">Edit CheckList</h5>
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">&times;</span>
                                                    </button>
                                                </div>
                                                <div class="modal-body">
                                                      <div class="form-group ">
                                                        <label>CheckList Description</label>
                                                        <textarea class="form-control" rows="2" name="txtMetricCheckList" id="txtMetricCheckList"></textarea>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-lg-6">
                                                            <label>CheckList Display Order</label>
                                                        <br />
                                                        <label>
                                                            <input type="number" min="1" id="txtDisplayOrder1" class="form-control" >

                                                        </label>
                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
                                                        <div class="col-lg-6">
                                                            <label>Required</label>
                                                            <br />
                                                        <select id="ddlchkOption" class="form-control">
                                                            <option value="1">Mandatory</option>
                                                            <option value="0">Optional</option>
                                                        </select>
                                                        </div>
                                                    </div>
                                                  
                                                </div>
                                                <div class="modal-footer">
                                                    <button type="button" class="btn btn-primary btn-sm" id="btnRenameCheckList">Save changes</button>
                                                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Close</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    
                                </ContentTemplate>
                                <Triggers>
                                    <asp:PostBackTrigger ControlID="lnkExportStages" />
                                    <asp:PostBackTrigger ControlID="btnStagesUpload" />
                                    <asp:PostBackTrigger ControlID="hlinkUploadedMetricDocuments" />
                                </Triggers>
                            </asp:UpdatePanel>


                        </ContentTemplate>

                    </cc1:TabPanel>
                    <cc1:TabPanel ID="TabPanel7" runat="server" HeaderText="TabPanel7">
                        <HeaderTemplate>
                           KeyIndicator Weightage
                        </HeaderTemplate>
                        <ContentTemplate>
                          <script type="text/javascript" src="js/jquery-2.1.3.min.js"></script>
                           <script type="text/javascript" src="js/jquery-ui-1.12.1.min.js"></script>
                                    <script type="text/javascript" src="Repository/datatables/js/datatables.min.js"></script>
                                    <link href="css/jquery-ui-1.12.1.min.css" rel="stylesheet" />
                                    <link href="Repository/datatables/css/datatables.min.css" rel="stylesheet" />
                                    <link href="js1/sweetalert.css" rel="stylesheet" />
                                    <script src="js1/sweetalert.min.js"></script>
                                    <script type="text/javascript" src="Repository/bootstrap/js/select2.min.js"></script>
                                    <link href="Repository/bootstrap/css/select2.min.css" rel="stylesheet" />
                             <script type="text/javascript">
                              
                                 function GetIndicatorWeightage() {
                                        //debugger;
                                        // alert('metric');
                                        if ($.fn.DataTable.isDataTable('#tblKeyWeightage')) {
                                            $('#tblKeyWeightage').DataTable().destroy();
                                        }
                                        var Criteria = $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel7_ddlKeyWeghtageCriteria').val();
                                        var Session = $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel7_ddlSessionKeyWeightage').val();
                                        // alert(Indicator);
                                        if (Criteria != null && Criteria != 'Select') {
                                            $.ajax({
                                                type: "POST",
                                                url: "frmCriteriaMaster.aspx/GetIndicatorWeightage",
                                                data: JSON.stringify({
                                                    CriteriaId: Criteria, plannerSessionId: Session
                                                }),
                                                contentType: "application/json; charset=utf-8",
                                                dataType: "json",
                                                success: OnSuccessKeyWeightage,
                                                failure: function (response) {
                                                    alert(response.d);
                                                },
                                                error: function (response) {
                                                    alert(response.d);
                                                },
                                                complete: function () {
                                                }

                                            });
                                        }
                                    }
                                    function OnSuccessKeyWeightage(response) {
                                        //debugger;
                                        $('#tblKeyWeightage').show();
                                        $("#tblKeyWeightage").DataTable(
                                        {
                                            dom: 'Bfrti',
                                            bLengthChange: true,
                                            lengthMenu: [[50, 100, -1], [50, 100, "All"]],
                                            bFilter: true,
                                            bSort: true,
                                            data: response.d,

                                            columns: [
                                                 { "data": "SNo" },
                                                  { "data": "IndicatorId" },
                                                { "data": "Description" },
                                              
                                               {
                                                   "data": "Weightage",
                                                   render: function (data, type, row) {
                                                       if (row.IndicatorId != 0)
                                                           return '<input style="width:100px;height:35px" type="number" min="0" class="form-control weightagekey"  onchange="CalculateKeyWeightage()" onkeyup="CalculateKeyWeightage()" type="text"  value = ' + row.Weightage + '  >';
                                                       else
                                                           return '<input id="txtTotalKeyWeightage" class="form-control weightagekey"  type="text" disabled  value = ' + row.Weightage + '  >';
                                                   }
                                               }
                                            ],
                                           
                                            buttons: [{
                                                extend: 'excel',
                                                text: 'Export to Excel',
                                                className: 'btn btn-warning',
                                                filename: 'MetricKeyWeightage',
                                                exportOptions: { columns: [0, 1,2,3], modifier: { page: 'all' /*'current'*/ } }

                                            }]
                                        }).columns.adjust();
                                       
                                    };
                                    $(document).ready(function () {
                                     
                                        AddSelect3();
                                    });
                                    function AddSelect3()
                                    {
                                    
                                        $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel7_ddlCriteriaKeyWeightage').select2();
                                        $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel7_ddlDivKeyWeightage').select2();
                                        $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel7_ddlSessionKeyWeightage').select2();
                                    }
                                    //function Select() {
                                    //    var callbacks = $.Callbacks();
                                    //    callbacks.add(AddSelect2);
                                    //}
                                    function CalculateKeyWeightage()
                                    {
                                        var totalKey = 0;
                                        //$('.weightage').change(function () {
                                        $(".weightagekey").each(function () {
                                            //debugger;
                                            var isDisabled = $(this).prop('disabled');

                                            if (isDisabled != true) {
                                                if ($(this).val()!="")
                                                totalKey = totalKey + parseFloat($(this).val());

                                            }
                                        });
                                        $('#txtTotalKeyWeightage').val(totalKey);
                                        if (totalKey > 100)
                                        {
                                            swal("Total weightage of  selected Indicator cannot be grater than 100");
                                        }
                                            //alert(total);
                                       //  })
                                        
                                    }
                                    function IndicatorWeightage() {
                                        $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel7_ddlKeyWeghtageCriteria').change(function () {
                                            if ($('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel7_ddlKeyWeghtageCriteria option:selected').val() != "0") {

                                                GetIndicatorWeightage();

                                                $('#tblKeyWeightage').show();
                                               // $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel7_btnSaveWeightage').show();

                                            }
                                        })
                                       
                                    }
                                    function SaveKeyWeightage()
                                    {
                                        if ($('#txtTotalKeyWeightage').val() > 100) {
                                            swal("Key Indicator(s) weightage exceed from 100");
                                            return false;
                                        }
                                        else {
                                            var dtTable = $('#tblKeyWeightage').DataTable()
                                            var TableData = new Array();
                                            var Session = $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel7_ddlSessionKeyWeightage option:selected').val();
                                           // alert(Session);
                                            $('#tblKeyWeightage tr').each(function (row1, tr) {
                                                //debugger;
                                               
                                                var disable = $(this).find('.weightagekey').prop('disabled');
                                               
                                                if (disable != undefined) {
                                                if (disable != true) {
                                                    var weightagekey = $(this).find('.weightagekey').val();
                                                    //alert($(this).find("td:nth-child(1)").html());
                                                    TableData[row1] = {
                                                        "IndicatorId": $(this).find("td:nth-child(2)").html()
                                                        , "Weightage": weightagekey
                                                    , "Session": Session

                                                    }
                                                }
                                                   
                                                }
                                               
                                            });
                                            $.ajax({
                                                type: "POST",
                                                url: "frmCriteriaMaster.aspx/SaveIndicatorWeightage",
                                                contentType: "application/json; charset=utf-8",
                                                dataType: "json",
                                                data: JSON.stringify({
                                                    lstUpdateData: TableData
                                                }),
                                                success: function (data) {
                                                    var msg = data.d;
                                                    $('#tblKeyWeightage').show();
                                                      
                                                    GetIndicatorWeightage();
                                                    $('#tblKeyWeightage').show();
                                                    swal(msg);

                                                },
                                                failure: function (response) {
                                                    alert(response.d);
                                                },
                                                error: function (xhr, status, error) {
                                                    var err = eval("(" + xhr.responseText + ")");
                                                    alert(err.Message);
                                                }
                                            })
                                        }
                                    }
                                   
                                 </script>
                             <script type="text/javascript" language="javascript">
                                 Sys.Application.add_load(IndicatorWeightage);
                                 Sys.Application.add_load(AddSelect3);
                                 </script>
                               <asp:UpdatePanel ID="UpdatePanel7" runat="server">
                                <ContentTemplate>
                                   
                             <table align="center" bgcolor="#cccccc" border="0" cellpadding="1" cellspacing="1" width="100%">
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label25" runat="server" Text="Planner Session :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlSessionKeyWeightage" runat="server" AutoPostBack="True"   Width="250px"></asp:DropDownList>
                                                            <asp:RequiredFieldValidator ID="RequiredFieldValidator16" runat="server" ControlToValidate="ddlSessionKeyWeightage" ErrorMessage="Please select session" InitialValue="Select" ForeColor="Red" ValidationGroup="Weightagekey">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label26" runat="server" Text="Division :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlDivKeyWeightage" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlDivKeyWeightage_SelectedIndexChanged" OnDataBound="ddlDivKeyWeightage_DataBound" Width="250px"></asp:DropDownList>
                                                            <asp:RequiredFieldValidator ID="RequiredFieldValidator39" runat="server" ControlToValidate="ddlDivKeyWeightage" ErrorMessage="Please select division" InitialValue="Select" ForeColor="Red" ValidationGroup="Weightagekey">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label27" runat="server" Text="Criteria :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlKeyWeghtageCriteria" OnDataBound="ddlKeyWeghtageCriteria_DataBound"  runat="server"   Width="250px"></asp:DropDownList><asp:RequiredFieldValidator ID="RequiredFieldValidator41" ForeColor="Red" runat="server" ControlToValidate="ddlKeyWeghtageCriteria" ErrorMessage="Please select criteria" InitialValue="Select" ValidationGroup="Weightagekey">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    
                                                
                                                </table>  
                                    <br />
                                    <br />
                                      
                                    
                                        <table id="tblKeyWeightage" class="table" style="display: none; width: 100%">
                                        <thead>
                                            <tr>
                                                <th>SNo</th>
                                                 <th>IndicatorId</th>
                                                <th>Description</th>
                                              
                                                <th>Weightage</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        </tbody>
                                    </table>
                                           
                                    <div style="margin-left:40%">
                                        
                                        <asp:Button ID="btnSaveKeyWeightage"  Height="30px" Width="100px" runat="server" Text="Submit" OnClientClick="SaveKeyWeightage()" ValidationGroup="Weightagekey" />
                                        <asp:Button ID="Button2" runat="server" Height="30px" Width="100px" Text="Reset" OnClick="btnResetWeightageKey_Click" />
                                       
                                    </div>
                              
                                    </ContentTemplate>
                                    </asp:UpdatePanel>
                        </ContentTemplate>
                    </cc1:TabPanel>
                         <cc1:TabPanel ID="TabPanel8" runat="server" HeaderText="TabPanel7">
                        <HeaderTemplate>
                           Criteria Weightage
                        </HeaderTemplate>
                        <ContentTemplate>
                          <script type="text/javascript" src="js/jquery-2.1.3.min.js"></script>
                           <script type="text/javascript" src="js/jquery-ui-1.12.1.min.js"></script>
                                    <script type="text/javascript" src="Repository/datatables/js/datatables.min.js"></script>
                                    <link href="css/jquery-ui-1.12.1.min.css" rel="stylesheet" />
                                    <link href="Repository/datatables/css/datatables.min.css" rel="stylesheet" />
                                    <link href="js1/sweetalert.css" rel="stylesheet" />
                                    <script src="js1/sweetalert.min.js"></script>
                                    <script type="text/javascript" src="Repository/bootstrap/js/select2.min.js"></script>
                                    <link href="Repository/bootstrap/css/select2.min.css" rel="stylesheet" />
                             <script type="text/javascript">
                              
                                 function GetCriteriaWeightage() {
                                        //debugger;
                                        // alert('metric');
                                        if ($.fn.DataTable.isDataTable('#tblCriteriaWeightage')) {
                                            $('#tblCriteriaWeightage').DataTable().destroy();
                                        }
                                        var Div = $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel8_ddlDivCriteriaWeightage').val();
                                        var Session = $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel8_ddlSessionCriteriaWeightage').val();
                                        // alert(Indicator);
                                        if (Div != null && Div != 'Select') {
                                            $.ajax({
                                                type: "POST",
                                                url: "frmCriteriaMaster.aspx/GetCriteriaWeightage",
                                                data: JSON.stringify({
                                                    DivId: Div, plannerSessionId: Session
                                                }),
                                                contentType: "application/json; charset=utf-8",
                                                dataType: "json",
                                                success: OnSuccessCriteriaWeightage,
                                                failure: function (response) {
                                                    alert(response.d);
                                                },
                                                error: function (response) {
                                                    alert(response.d);
                                                },
                                                complete: function () {
                                                }

                                            });
                                        }
                                    }
                                    function OnSuccessCriteriaWeightage(response) {
                                        //debugger;
                                        $('#tblCriteriaWeightage').show();
                                        $("#tblCriteriaWeightage").DataTable(
                                        {
                                            dom: 'Bfrti',
                                            bLengthChange: true,
                                            lengthMenu: [[50, 100, -1], [50, 100, "All"]],
                                            bFilter: true,
                                            bSort: true,
                                            data: response.d,

                                            columns: [
                                                 { "data": "SNo" },
                                                  { "data": "CriteriaId" },
                                                { "data": "Description" },
                                              
                                               {
                                                   "data": "Weightage",
                                                   render: function (data, type, row) {
                                                       if (row.CriteriaId != 0)
                                                           return '<input style="width:100px;height:35px" type="number" min="0" class="form-control weightagecriteria" "name="Markup" onchange="CalculateCriteriaWeightage()" onkeyup="CalculateCriteriaWeightage()" type="text"  value = ' + row.Weightage + '  >';
                                                       else
                                                           return '<input id="txtTotalCriteriaWeightage" class="form-control weightagecriteria" "name="Markup" type="text" disabled  value = ' + row.Weightage + '  >';
                                                   }
                                               }
                                            ],
                                           
                                            buttons: [{
                                                extend: 'excel',
                                                text: 'Export to Excel',
                                                className: 'btn btn-warning',
                                                filename: 'MetricKeyWeightage',
                                                exportOptions: { columns: [0, 1,2,3], modifier: { page: 'all' /*'current'*/ } }

                                            }]
                                        }).columns.adjust();
                                       
                                    };
                                    $(document).ready(function () {
                                     
                                        AddSelect4();
                                    });
                                    function AddSelect4()
                                    {
                                        $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel8_ddlDivCriteriaWeightage').select2();
                                        $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel8_ddlSessionCriteriaWeightage').select2();
                                    }
                                   
                                    function CalculateCriteriaWeightage()
                                    {
                                        var totalKey = 0;
                                        //$('.weightage').change(function () {
                                        $(".weightagecriteria").each(function () {
                                            //debugger;
                                            var isDisabled = $(this).prop('disabled');

                                            if (isDisabled != true) {
                                                if ($(this).val()!="")
                                                totalKey = totalKey + parseFloat($(this).val());

                                            }
                                        });
                                        $('#txtTotalCriteriaWeightage').val(totalKey);
                                        if (totalKey > 100)
                                        {
                                            swal("Total weightage of  selected division cannot be grater than 100");
                                        }
                                            //alert(total);
                                       //  })
                                        
                                    }
                                    function CriteriaWeightage() {
                                        $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel8_ddlDivCriteriaWeightage').change(function () {
                                            if ($('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel8_ddlDivCriteriaWeightage option:selected').val() != "0") {

                                                GetCriteriaWeightage();

                                                $('#tblCriteriaWeightage').show();
                                              
                                            }
                                        })
                                       
                                    }
                                    function SaveCriteriaWeightage()
                                    {
                                        if ($('#txtTotalCriteriaWeightage').val() > 100) {
                                            swal("Criteria(s) weightage exceed from 100");
                                            return false;
                                        }
                                        else {
                                            var dtTable = $('#tblCriteriaWeightage').DataTable()
                                            var TableData = new Array();
                                            var Session = $('#ctl00_ContentPlaceHolder1_TabContainer1_TabPanel8_ddlSessionCriteriaWeightage option:selected').val();
                                           // alert(Session);
                                            $('#tblCriteriaWeightage tr').each(function (row1, tr) {
                                                //debugger;
                                               
                                                var disable = $(this).find('.weightagecriteria').prop('disabled');
                                               
                                                if (disable != undefined) {
                                                if (disable != true) {
                                                    var weightagecriteria = $(this).find('.weightagecriteria').val();
                                                    //alert($(this).find("td:nth-child(1)").html());
                                                    TableData[row1] = {
                                                        "CriteriaId": $(this).find("td:nth-child(2)").html()
                                                        , "Weightage": weightagecriteria
                                                    , "Session": Session

                                                    }
                                                }
                                                   
                                                }
                                               
                                            });
                                            $.ajax({
                                                type: "POST",
                                                url: "frmCriteriaMaster.aspx/SaveCriteriaWeightage",
                                                contentType: "application/json; charset=utf-8",
                                                dataType: "json",
                                                data: JSON.stringify({
                                                    lstUpdateData: TableData
                                                }),
                                                success: function (data) {
                                                    var msg = data.d;
                                                    $('#tblCriteriaWeightage').show();
                                                      
                                                    GetCriteriaWeightage();
                                                    $('#tblCriteriaWeightage').show();
                                                    swal(msg);
                                                    $('#tblCriteriaWeightage').show();

                                                },
                                                failure: function (response) {
                                                    alert(response.d);
                                                },
                                                error: function (xhr, status, error) {
                                                    var err = eval("(" + xhr.responseText + ")");
                                                    alert(err.Message);
                                                },
                                                complete:function(){
                                                    $('#tblCriteriaWeightage').show();
                                            }
                                            })
                                        }
                                        $('#tblCriteriaWeightage').show();
                                    }
                                   
                             </script>
                             <script type="text/javascript" language="javascript">
                                 Sys.Application.add_load(CriteriaWeightage);
                                 Sys.Application.add_load(AddSelect4);
                                 </script>
                               <asp:UpdatePanel ID="UpdatePanel8" runat="server">
                                <ContentTemplate>
                                   
                             <table align="center" bgcolor="#cccccc" border="0" cellpadding="1" cellspacing="1" width="100%">
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label1" runat="server" Text="Planner Session :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlSessionCriteriaWeightage" runat="server" AutoPostBack="True"   Width="250px"></asp:DropDownList>
                                                            <asp:RequiredFieldValidator ID="RequiredFieldValidator4" runat="server" ControlToValidate="ddlSessionCriteriaWeightage" ErrorMessage="Please select session" InitialValue="Select" ForeColor="Red" ValidationGroup="Weightagecriteria">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    <tr>
                                                        <td class="input_form_caption_td">
                                                            <asp:Label ID="Label29" runat="server" Text="Division :"></asp:Label></td>
                                                        <td class="input_form_caption_td">
                                                            <asp:DropDownList ID="ddlDivCriteriaWeightage" runat="server"  OnDataBound="ddlDivCriteriaWeightage_DataBound" Width="250px"></asp:DropDownList>
                                                            <asp:RequiredFieldValidator ID="RequiredFieldValidator8" runat="server" ControlToValidate="ddlDivCriteriaWeightage" ErrorMessage="Please select division" InitialValue="Select" ForeColor="Red" ValidationGroup="Weightagecriteria">*</asp:RequiredFieldValidator></td>
                                                    </tr>
                                                    
                                                    
                                                
                                                </table>  
                                    <br />
                                    <br />
                                      
                                    
                                        <table id="tblCriteriaWeightage" class="table" style="display: none; width: 100%">
                                        <thead>
                                            <tr>
                                                <th>SNo</th>
                                                 <th>CriteriaId</th>
                                                <th>Description</th>
                                              
                                                <th>Weightage</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        </tbody>
                                    </table>
                                           
                                    <div style="margin-left:40%">
                                        
                                        <asp:Button ID="Button3"  Height="30px" Width="100px" runat="server" Text="Submit" OnClientClick="SaveCriteriaWeightage()" ValidationGroup="Weightagecriteria" />
                                        <asp:Button ID="Button4" runat="server" Height="30px" Width="100px" Text="Reset" OnClick="btnResetWeightageCriteria_Click" />
                                       
                                    </div>
                              
                                    </ContentTemplate>
                                    </asp:UpdatePanel>
                        </ContentTemplate>
                    </cc1:TabPanel>


                </cc1:TabContainer></td>
        </tr>

    </table>
    <script type="text/javascript">
        function isNumberKey(evt) {
            var charCode = (evt.which) ? evt.which : event.keyCode
            if (charCode > 31 && (charCode != 46 && (charCode < 48 || charCode > 57)))
                return false;
            return true;
        }


        function validateFile(file) {
            //debugger;
            var ext = file.split(".");

            ext = ext[ext.length - 1].toLowerCase();
            var arrayExtensions = ["pdf", "xls", "zip"];
            if (ext !== 'pdf' && ext !== 'xls' && ext !== 'zip') {
                $('#<%=fuPDFDocument.ClientID%>').val("");
                alert("Upload the file in pdf,xls or zip format only.");

            }
            else {

                var iSize = $('#<%=fuPDFDocument.ClientID%>')[0].files[0].size;
                if (iSize > 1048576) {
                    alert("Upload file with maximum size of 1 MB.");
                    $('#<%=fuPDFDocument.ClientID%>').val("");
                }
                else {
                    iSize = (Math.round(iSize * 100) / 100)
                }
            }
            var specialChars = "<>@!#$%^&*()+[]{}?";
            var checkForSpecialChar = function (string) {
                for (i = 0; i < specialChars.length; i++) {
                    if (string.indexOf(specialChars[i]) > -1) {
                        return true
                    }
                }
                return false;
            }


            if (checkForSpecialChar(file)) {
                alert("Special characters are not allowed in File Name.");
                $('#<%=fuPDFDocument.ClientID%>').val("");
            }
            else {
               
            }
        }

        function func_btnClick(e) {
            e.preventDefault();
            var hiddenReferenceDoc = document.getElementById('<%= hdnReferenceDocUpdate.ClientID %>');
            var filepath = document.getElementById('<%= hdnFilePath.ClientID %>');
              window.location.href = "DownloadFtp.aspx?Filename=" + hiddenReferenceDoc.value + ',' + filepath.value;
         }

    </script>
</asp:Content>

