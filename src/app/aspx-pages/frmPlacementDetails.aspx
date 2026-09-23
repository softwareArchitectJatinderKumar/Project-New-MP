<%@ Page Language="C#" MasterPageFile="~/AdminMaster.master" AutoEventWireup="true"
    CodeFile="frmPlacementDetails.aspx.cs" Inherits="frmPlacementDetails" Title="Placement Details" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" runat="Server">
    <%--<asp:UpdatePanel ID="up" runat="server">
     <Triggers>
            <asp:PostBackTrigger ControlID="btnExportToExcel"/>
        </Triggers>
        <ContentTemplate>
            </ContentTemplate>
         </asp:UpdatePanel>--%>
    <table cellpadding='1' cellspacing='5' border='0' width="100%" align="left">
        <tr>
            <td class="form_header" align="center" colspan="2">Placement Details
            </td>
        </tr>

        <tr>
            <td width="40%" class="input_form_caption_td" align="right" valign="top">Select Batch/Year:
            </td>
            <td class="input_form_caption_td" align="left" valign="top">
                <asp:DropDownList runat="server" ID="ddlBatchYear" OnSelectedIndexChanged="ddlBatchYear_SelectedIndexChanged" AutoPostBack="true">
                </asp:DropDownList><asp:RequiredFieldValidator ID="RequiredFieldValidator1" ValidationGroup="a" ControlToValidate="ddlBatchYear"
                    InitialValue="0" runat="server" ErrorMessage="Select Batch Year">*</asp:RequiredFieldValidator>
            </td>
        </tr>

        <tr>
            <td class="input_form_caption_td" align="right" valign="top">Select Discipline:
            </td>
            <td class="input_form_caption_td" align="left" valign="top">
                <asp:DropDownList ID="ddlStream" runat="server" AutoPostBack="true" OnSelectedIndexChanged="ddlStream_SelectedIndexChanged">
                </asp:DropDownList>
            </td>
        </tr>
        <tr id="trSubStream" runat="server">
            <td class="input_form_caption_td" align="right" valign="top">Select Sub Stream:
            </td>
            <td class="input_form_caption_td" align="left" valign="top">

                <asp:DropDownList ID="cbSubStream" runat="server">
                </asp:DropDownList>

            </td>
        </tr>

        <tr>
            <td class="input_form_caption_td" align="center" colspan="2">
                <asp:Button ID="btnShow" Text="Show" runat="server" OnClick="btnShow_Click" ValidationGroup="a" />
                <asp:Button runat="server" Visible="false" ID="btnExportToExcel" OnClick="btnExportToExcel_Click"
                    Text="Export To Excel" />
            </td>
        </tr>
        <tr>
            <td class="input_form_caption_td" align="center" colspan="2">
                <asp:Panel runat="server" ID="pnlDetails" Width="980px" ScrollBars="Horizontal">
                    <telerik:RadGrid ID="gvDriveDetails" runat="server" AllowFilteringByColumn="False"
                        GridLines="None" Skin="Default" EnableTheming="false" AutoGenerateColumns="false"
                        AllowPaging="True" OnPageIndexChanged="gvDriveDetails_PageIndexChanged" OnItemDataBound="gvDriveDetails_ItemDataBound">
                        <MasterTableView>
                            <Columns>
                                <telerik:GridBoundColumn DataField="CompanyName" HeaderText="Company Name" UniqueName="CompanyName">
                                    <ItemStyle />
                                </telerik:GridBoundColumn>
                                <telerik:GridBoundColumn DataField="DriveType" HeaderText="Drive Type" UniqueName="DriveType">
                                    <ItemStyle />
                                </telerik:GridBoundColumn>

                                <%--   <telerik:GridBoundColumn DataField="Category" HeaderText="Company Category" UniqueName="Category">
                                </telerik:GridBoundColumn>--%>
                                <telerik:GridBoundColumn DataField="DriveId" HeaderText="Drive Id" UniqueName="DriveId">
                                </telerik:GridBoundColumn>
                                <telerik:GridBoundColumn DataField="DriveCategory" HeaderText="Drive Category" UniqueName="DriveCategory">
                                </telerik:GridBoundColumn>
                                <telerik:GridBoundColumn DataField="ACTIVE" HeaderText="Is Active" UniqueName="ACTIVE">
                                </telerik:GridBoundColumn>
                                <telerik:GridBoundColumn DataField="IsConducted" HeaderText="Is Conducted" UniqueName="IsConducted">
                                </telerik:GridBoundColumn>
                                <telerik:GridBoundColumn DataField="CompanyRelation" HeaderText="Company Relation" UniqueName="CompanyRelation">
                                </telerik:GridBoundColumn>
                                <telerik:GridBoundColumn DataField="PrimaryDiscipline" HeaderText="Primary Discipline" UniqueName="PrimaryDiscipline">
                                </telerik:GridBoundColumn>
                                <telerik:GridBoundColumn DataField="Stream" HeaderText="Eligible Streams" UniqueName="Stream">
                                </telerik:GridBoundColumn>
                                <telerik:GridBoundColumn DataField="SubStream" HeaderText="SubStreams" UniqueName="SubStream">
                                </telerik:GridBoundColumn>
                                <telerik:GridBoundColumn HeaderText="Drive Date" DataField="DriveDate" UniqueName="DriveDate">
                                </telerik:GridBoundColumn>
                                <telerik:GridBoundColumn HeaderText="Date Status" DataField="DriveDateStatus" UniqueName="DriveDateStatus">
                                </telerik:GridBoundColumn>
                                <telerik:GridBoundColumn HeaderText="Designation" DataField="Designation" UniqueName="Designation">
                                </telerik:GridBoundColumn>
                                <telerik:GridBoundColumn HeaderText="Job Location" DataField="JobLocation" UniqueName="JobLocation">
                                </telerik:GridBoundColumn>
                                <telerik:GridBoundColumn HeaderText="Package" DataField="SalaryPackage" UniqueName="Package">
                                </telerik:GridBoundColumn>

                                <telerik:GridBoundColumn HeaderText="Min Salary" DataField="MinSalary" UniqueName="MinSalary">
                                </telerik:GridBoundColumn>

                                <telerik:GridBoundColumn HeaderText="Max Salary" DataField="MaxSalary" UniqueName="MaxSalary">
                                </telerik:GridBoundColumn>

                                <telerik:GridBoundColumn HeaderText="Package Description" DataField="SalaryDesc" UniqueName="SalaryDesc">
                                </telerik:GridBoundColumn>

                                <telerik:GridBoundColumn HeaderText="Vacancies" DataField="Vacancies" UniqueName="Vacancies">
                                </telerik:GridBoundColumn>
                                <telerik:GridBoundColumn HeaderText="Result Declared" DataField="ResultDeclared"
                                    UniqueName="ResultDeclared">
                                </telerik:GridBoundColumn>
                                <telerik:GridBoundColumn HeaderText="Provider" DataField="PROVIDER"
                                    UniqueName="PROVIDER">
                                </telerik:GridBoundColumn>
                                <telerik:GridBoundColumn HeaderText="Provider Detail" DataField="ProviderDetail"
                                    UniqueName="ProviderDetail">
                                </telerik:GridBoundColumn>
                                <telerik:GridBoundColumn HeaderText="Ownership" DataField="OWNERSHIP"
                                    UniqueName="OWNERSHIP">
                                </telerik:GridBoundColumn>
                                <telerik:GridBoundColumn HeaderText="Owner Department" DataField="Department"
                                    UniqueName="Department">
                                </telerik:GridBoundColumn>
                                <%--<telerik:GridTemplateColumn HeaderText="Selected Candidates" AllowFiltering="False"
                                    UniqueName="TotalSelectedCandidates">
                                    <ItemTemplate>
                                        <asp:HyperLink Target="_blank" runat="server" ID="totalSelected" ToolTip="View Details"
                                            Text='<%# Eval("TotalSelectedCandidates") %>' NavigateUrl='<%# "frmPlacementSelectedCandidates.aspx?id="+ Eval("DriveId")  %>'></asp:HyperLink>
                                    </ItemTemplate>
                                </telerik:GridTemplateColumn>
                                <telerik:GridTemplateColumn HeaderText="Stream/Substream Selection" AllowFiltering="False"
                                    UniqueName="TotalSelectedCandidates2">
                                    <ItemTemplate>
                                        <asp:HyperLink Target="_blank" runat="server" ID="totalSelected2" ToolTip="View Details"
                                            Text='<%# Eval("TotalSelectedCandidates2") %>' NavigateUrl='<%# "frmPlacementSelectedCandidates.aspx?id="+ Eval("DriveId")  %>'></asp:HyperLink>
                                    </ItemTemplate>
                                </telerik:GridTemplateColumn>--%>
                                <telerik:GridTemplateColumn AllowFiltering="False" UniqueName="TotalEligibleCandidates" HeaderText="Eligible Candidates Count">
                                    <ItemTemplate>
                                        <asp:HyperLink Target="_blank" runat="server" ID="hypTotalEligibleCandidates" ToolTip="View Details of Total Eligible Candidates"
                                            Text='<%# Eval("TotalEligibleCandidates")  %>' NavigateUrl='<%# "frmPlacementDriveCandidates.aspx?type=A&id="+ Eval("DriveId")  %>'></asp:HyperLink>
                                    </ItemTemplate>
                                </telerik:GridTemplateColumn>
                                <telerik:GridTemplateColumn AllowFiltering="False" UniqueName="TotalRegisteredCandidates" HeaderText="Registered Candidates Count">
                                    <ItemTemplate>
                                        <asp:HyperLink Target="_blank" runat="server" ID="hypTotalRegisteredCandidates" ToolTip="View Details of Total Registered Candidates"
                                            Text='<%# Eval("TotalRegisteredCandidates")  %>' NavigateUrl='<%# "frmPlacementDriveCandidates.aspx?type=R&id="+ Eval("DriveId")  %>'></asp:HyperLink>
                                    </ItemTemplate>
                                </telerik:GridTemplateColumn>
                                <telerik:GridTemplateColumn AllowFiltering="False" UniqueName="TotalParticipated" HeaderText="Participated Candidates Count">
                                    <ItemTemplate>
                                        <asp:HyperLink Target="_blank" runat="server" ID="hypTotalParticipated" ToolTip="View Details of Total participated Candidates"
                                            Text='<%# Eval("TotalParticipated")  %>' NavigateUrl='<%# "frmPlacementDriveCandidates.aspx?type=P&id="+ Eval("DriveId")  %>'></asp:HyperLink>
                                    </ItemTemplate>
                                </telerik:GridTemplateColumn>

                                <telerik:GridTemplateColumn AllowFiltering="False" UniqueName="TotalSelectedCandidates" HeaderText="Candidate Placed">
                                    <ItemTemplate>
                                        <asp:HyperLink Target="_blank" runat="server" ID="hypTotalSelectedCandidates" ToolTip="View Details of Total Selected Candidates"
                                            Text='<%# Eval("TotalSelectedCandidates")  %>' NavigateUrl='<%# "frmPlacementDriveCandidates.aspx?type=S&id="+ Eval("DriveId")  %>'></asp:HyperLink>
                                    </ItemTemplate>
                                </telerik:GridTemplateColumn>

                                <telerik:GridTemplateColumn AllowFiltering="False" UniqueName="TotalStreamEligibleCandidates" HeaderText="Stream Eligible Candidates Count">
                                    <ItemTemplate>
                                        <asp:HyperLink Target="_blank" runat="server" ID="hypTotalStreamEligibleCandidates" ToolTip="View Details of Total Eligible Candidates"
                                            Text='<%# Eval("TotalStreamEligibleCandidates")  %>' NavigateUrl='<%# "frmPlacementDriveCandidates.aspx?type=SA&id="+ Eval("DriveId")  %>'></asp:HyperLink>
                                    </ItemTemplate>
                                </telerik:GridTemplateColumn>
                                <telerik:GridTemplateColumn AllowFiltering="False" UniqueName="TotalStreamRegisteredCandidates" HeaderText="Stream Registered Candidates Count">
                                    <ItemTemplate>
                                        <asp:HyperLink Target="_blank" runat="server" ID="hypTotalStreamRegisteredCandidates" ToolTip="View Details of Total Registered Candidates"
                                            Text='<%# Eval("TotalStreamRegisteredCandidates")  %>' NavigateUrl='<%# "frmPlacementDriveCandidates.aspx?type=SR&id="+ Eval("DriveId")  %>'></asp:HyperLink>
                                    </ItemTemplate>
                                </telerik:GridTemplateColumn>
                                <telerik:GridTemplateColumn AllowFiltering="False" UniqueName="TotalStreamParticipated" HeaderText="Stream Participated Candidates Count">
                                    <ItemTemplate>
                                        <asp:HyperLink Target="_blank" runat="server" ID="hypTotaStreamlParticipated" ToolTip="View Details of Total participated Candidates"
                                            Text='<%# Eval("TotalStreamParticipated")  %>' NavigateUrl='<%# "frmPlacementDriveCandidates.aspx?type=SP&id="+ Eval("DriveId")  %>'></asp:HyperLink>
                                    </ItemTemplate>
                                </telerik:GridTemplateColumn>
                                <telerik:GridTemplateColumn AllowFiltering="False" UniqueName="TemplateColumn" HeaderText="Stream/Substream Selection">
                                    <ItemTemplate>
                                        <asp:HyperLink Target="_blank" runat="server" ID="hypNONLPUStreamDetails" ToolTip="Stream/Substream Selection"
                                            Text='<%# Eval("TotalSelectedCandidates2")  %>' NavigateUrl='<%# "frmPlacementDriveCandidates.aspx?type=SS&id="+ Eval("DriveId")  %>'></asp:HyperLink>
                                    </ItemTemplate>
                                </telerik:GridTemplateColumn>
                                <%--<telerik:GridTemplateColumn AllowFiltering="False" UniqueName="TemplateColumn">
                                    <ItemTemplate>
                                        <asp:HyperLink Target="_blank" runat="server" ID="hypDetails" ToolTip="View Details"
                                            Text='View Details' NavigateUrl='<%# "DriveDetails.aspx?id="+ Eval("DriveId")  %>'></asp:HyperLink>
                                    </ItemTemplate>
                                </telerik:GridTemplateColumn>--%>
                                <telerik:GridTemplateColumn AllowFiltering="False" UniqueName="TemplateColumn" HeaderText="Drive Notice">
                                    <ItemTemplate>
                                        <asp:HyperLink Target="_blank" runat="server" ID="hypDetails" ToolTip="View Details"
                                            Text='View Details' NavigateUrl='<%# "DriveDetails.aspx?id="+ Eval("DriveId")  %>'></asp:HyperLink>
                                        <asp:Label runat="server" ID="lblDriveId"
                                            Text='<%# Eval("DriveID") %>' Visible="false"></asp:Label>
                                    </ItemTemplate>
                                </telerik:GridTemplateColumn>
                                <telerik:GridBoundColumn HeaderText="Percentage Selection" DataField="PercentageSelection" UniqueName="PercentageSelection">
                                </telerik:GridBoundColumn>
                                <telerik:GridBoundColumn HeaderText="PercentageRegistered Candidates" DataField="PercentageRegisteredCAndidates" UniqueName="PercentageRegisteredCAndidates">
                                </telerik:GridBoundColumn>
                            </Columns>
                            <CommandItemSettings ExportToPdfText="Export to Pdf" />
                            <PagerStyle AlwaysVisible="True" />
                        </MasterTableView>
                        <PagerStyle AlwaysVisible="True" />
                        <HeaderContextMenu CssClass="GridContextMenu GridContextMenu_Outlook" EnableImageSprites="True">
                        </HeaderContextMenu>
                    </telerik:RadGrid>&nbsp;
                    <asp:HiddenField Visible="false" ID="hfsubstream" runat="server" />
                </asp:Panel>
            </td>
        </tr>
    </table>

</asp:Content>
