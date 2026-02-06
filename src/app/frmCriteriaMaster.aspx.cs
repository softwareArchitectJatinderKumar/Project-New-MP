using FtpClient;
using Microsoft.ApplicationBlocks.Data;
using System;
using System.Collections;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;
using Telerik.Web.UI;
using System.Collections.Generic;
using System.Web;
using System.Xml;
using System.Linq;
using ClosedXML.Excel;
using Telerik.Web.UI.Widgets;
using Org.BouncyCastle.Crypto.Tls;

public partial class frmCriteriaMaster : BasePage
{
    public String constr = Convert.ToString(System.Configuration.ConfigurationManager.ConnectionStrings["NewUMSConnectionString"]);
    SqlCommand cmd = new SqlCommand();
    static SqlConnection con = new SqlConnection();
    public string strPath, FileName;
    public DataSet DsDivision;
    public DataSet DsCriteriaList;
    public DataSet DsSession;
    public DataSet DsKI;
    public DataSet DsCriteria;
    public string strPath1;
    public bool FileUploaded;
    public static List<string> ParentPointIds = new List<string>();
    protected void Page_Load(object sender, EventArgs e)
    {
        Page.MaintainScrollPositionOnPostBack = true;
        con = new SqlConnection(constr);
        con.Open();
        if (!Page.IsPostBack)
        {
             Session["LoginName"] = "29116";
            //CheckAccess obj = new CheckAccess();
            //bool isaccess = obj.func(Convert.ToInt32(Session["RollId"]), Request.Url.Segments[2].ToString(), Session["LoginName"].ToString());
            //if (!isaccess)
            //{
            //    this.Form.Visible = false;
            //    Response.Write(UnAuthorisedAccess.Message(""));
            //}

            BindSession();
            bindWeightageSession();
            BindDivisionList();
            BindDivisionListKi();
            bindMetricLevel();
            hdnFilePath.Value = Convert.ToString(SqlHelper.ExecuteScalar(con, CommandType.Text, "SELECT dbo.fGetPropertyPageValue('Metric Documents', 'Document File Path')"));
            dluploadedMetricDocList.Enabled = false;
            BindAccreditation();


        }
    }

    protected void btnSaveCriteria_Click(object sender, EventArgs e)
    {
        try
        {
            if (rblCriteriaOption.SelectedValue == "S")
            {
                con = new SqlConnection(constr);
                con.Open();
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandText = "pSaveCriteria";
                cmd.Connection = con;
                cmd.Parameters.AddWithValue("@type", "saveCriteria");
                cmd.Parameters.AddWithValue("@Criteria", txtCriteria1.Text.Trim());
                cmd.Parameters.AddWithValue("@DivisionId", ddlCriteriaDivision.SelectedValue);
                //cmd.Parameters.AddWithValue("@Weightage", txtCriteriaWeightage.Text);
                cmd.Parameters.AddWithValue("@EntryBy", Session["LoginName"]);
                SqlDataAdapter da = new SqlDataAdapter("select * from KRAKPICriterMaster where description=@desc and DivisionId=@div and Isactive=1 ", con);
                da.SelectCommand.Parameters.AddWithValue("@desc", txtCriteria1.Text.Trim());
                da.SelectCommand.Parameters.AddWithValue("@div", ddlCriteriaDivision.SelectedValue);
                DataSet ds = new DataSet();
                da.Fill(ds);
                if (ds.Tables[0].Rows.Count > 0)
                {
                    DisplayAJAXMessage(this, "Criteria " + txtCriteria1.Text.Trim() + " exists already, Please enter different criteria.");
                    return;
                }
                else
                {
                    cmd.ExecuteNonQuery();
                    cmd.Dispose();
                    con.Close();
                    cmd.Parameters.Clear();
                    txtCriteria1.Text = "";
                    //txtCriteriaWeightage.Text = "";
                    DisplayAJAXMessage(this, "Successfully Submitted...");
                    return;
                }
            }
            else
            {
                for (int i = 0; i < grdCriteria.Rows.Count; i++)
                {
                    con = new SqlConnection(constr);
                    con.Open();
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandText = "pSaveCriteria";
                    cmd.Connection = con;
                    cmd.Parameters.AddWithValue("@type", "saveCriteria");
                    cmd.Parameters.AddWithValue("@Criteria", (grdCriteria.Rows[i].FindControl("lblCriteria") as Label).Text);
                    cmd.Parameters.AddWithValue("@DivisionId", ddlCriteriaDivision.SelectedValue);
                    //cmd.Parameters.AddWithValue("@Weightage", (grdCriteria.Rows[i].FindControl("lblWeightage") as Label).Text);
                    cmd.Parameters.AddWithValue("@EntryBy", Session["LoginName"]);
                    SqlDataAdapter da = new SqlDataAdapter("select * from KRAKPICriterMaster where description=@desc and DivisionId=@div and Isactive=1", con);
                    da.SelectCommand.Parameters.AddWithValue("@desc", (grdCriteria.Rows[i].FindControl("lblCriteria") as Label).Text);
                    da.SelectCommand.Parameters.AddWithValue("@div", ddlCriteriaDivision.SelectedValue);
                    DataSet ds = new DataSet();
                    da.Fill(ds);
                    if (ds.Tables[0].Rows.Count > 0)
                    {
                        DisplayAJAXMessage(this, "Criteria " + (grdCriteria.Rows[i].FindControl("lblCriteria") as Label).Text + " exists already, Please enter different criteria.");
                        return;
                    }
                    else
                    {
                        cmd.ExecuteNonQuery();
                        cmd.Dispose();
                        con.Close();
                        cmd.Parameters.Clear();
                    }
                }
                if (grdCriteria.Rows.Count > 0)
                {
                    ddlCriteriaDivision.SelectedIndex = 0;
                    grdCriteria.DataBind();
                    DisplayAJAXMessage(this, "Successfully Submitted...");
                    return;
                }
                else
                {
                    DisplayAJAXMessage(this, "Please upload file first");
                    return;
                }
            }
        }
        catch (Exception ex)
        {
            string Msg = ex.Message.ToString();
            Msg = Msg.Replace("'", "");
            Msg = Msg.Replace("\r\n", "");
            DisplayAJAXMessage(this, Msg);
        }
    }

    protected void btnUploadFee_Click(object sender, EventArgs e)
    {
        try
        {
            TabContainer1.ActiveTabIndex = 0;
            ArrayList errorList;
            errorList = new ArrayList();
            DataTable dt; dt = new DataTable();
            bool isError;
            isError = false;
            if (fuUploadCriteria.HasFile)
            {
                if (System.IO.Path.GetExtension(fuUploadCriteria.FileName) == ".xls")
                {
                    string FileName = Guid.NewGuid().ToString() + Path.GetFileName(fuUploadCriteria.PostedFile.FileName);
                    string Extension = Path.GetExtension(fuUploadCriteria.PostedFile.FileName);
                    string FolderPath = ConfigurationManager.AppSettings["FolderPath"];
                    strPath = Server.MapPath(FolderPath + "/" + FileName);
                    fuUploadCriteria.SaveAs(strPath);
                    dt = ExcelLibrary.DataSetHelper.CreateDataTable(strPath, "Sheet1");

                    for (int i = 0; i < dt.Rows.Count; i++)
                    {
                        //if (Convert.ToInt32(dt.Rows[i]["Weightage"]) < 0)
                        //{
                        //    errorList.Add(" Invalid Value in Row- " + (i + 1) + " Column-Weightage");
                        //    isError = true;
                        //}
                        if (System.Text.RegularExpressions.Regex.IsMatch(dt.Rows[i]["Criteria"].ToString(),
                                          "^[ A-Za-z0-9-&()]*$") != true)
                        {
                            errorList.Add(" Invalid Value in Row- " + (i + 1) + " Special characters are not allowed, except -()& Column-Criteria");
                            isError = true;

                        }
                    }

                    if (isError)
                    {
                        grdError1.DataSource = errorList;
                        grdError1.DataBind();
                        btnSaveCriteria.Visible = false;
                        grdCriteria.DataSource = dt;
                        grdCriteria.DataBind();
                        File.Delete(strPath);
                    }
                    else
                    {
                        grdError1.DataSource = null;
                        grdError1.DataBind();
                        btnSaveCriteria.Visible = true;
                        grdCriteria.DataSource = dt;
                        grdCriteria.DataBind();
                        File.Delete(strPath);
                    }
                }
                else
                {
                    DisplayAJAXMessage(this, "Please upload only .xls extension file");
                    return;
                }
            }
        }
        catch (Exception ex)
        {
            lblerror0.Text = "Error '" + ex.Message + "' '" + ex.Source + "' ";
        }
    }
    static public void DisplayAJAXMessage(Control page, string msg)
    {
        string myScript = String.Format("alert('{0}');", msg);
        ScriptManager.RegisterStartupScript(page, page.GetType(), "MyScript", myScript, true);
    }

    protected void btnResetCriteria_Click(object sender, EventArgs e)
    {
        //ddlCriteriaSession.SelectedIndex = 0;
        ddlCriteriaDivision.SelectedIndex = 0;
        rblCriteriaOption.ClearSelection();
        txtCriteria1.Text = "";
        //txtCriteriaWeightage.Text = "";
        grdCriteria.DataBind();
        lblerror0.Text = "";
    }
    public void BindSession()
    {
        SqlParameter[] param = new SqlParameter[1];
        param[0] = new SqlParameter("@type", "getSession");
        DsSession = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pCriteriaMappingWithKeyIndicator", param);
        //ddlSession.DataSource = DsSession;
        //ddlSession.DataTextField = "Name";
        //ddlSession.DataValueField = "Id";
        //ddlSession.DataBind();

        //ddlCriteriaSession.DataSource = DsSession;
        //ddlCriteriaSession.DataTextField = "Name";
        //ddlCriteriaSession.DataValueField = "Id";
        //ddlCriteriaSession.DataBind();

        //ddlSessionMetric.DataSource = DsSession;
        //ddlSessionMetric.DataTextField = "Name";
        //ddlSessionMetric.DataValueField = "Id";
        //ddlSessionMetric.DataBind();

        //ddlSessionStages.DataSource = DsSession;
        //ddlSessionStages.DataTextField = "Name";
        //ddlSessionStages.DataValueField = "Id";
        //ddlSessionStages.DataBind();

        //ddlSessionMaster.DataSource = DsSession;
        //ddlSessionMaster.DataTextField = "Name";
        //ddlSessionMaster.DataValueField = "Id";
        //ddlSessionMaster.DataBind();

        //ddlSession.SelectedIndex = 1;
        // ddlCriteriaSession.SelectedIndex = 1;
        //ddlSessionMetric.SelectedIndex = 1;
        //ddlSessionStages.SelectedIndex = 1;
        // ddlSessionMaster.SelectedIndex = 1;


        bindDsDivision();
        BindDivisionListKi();
        bindDivList();
        bindDivStages();
        bindMasterDiv();
    }
    public void BindDivisionList()
    {
        SqlParameter[] param = new SqlParameter[1];
        param[0] = new SqlParameter("@type", "getDivision");
        // param[1] = new SqlParameter("@SessionId", ddlSession.SelectedValue);
        DsDivision = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pCriteriaMappingWithKeyIndicator", param);
        ddlDivisionList.DataSource = DsDivision;
        ddlDivisionList.DataTextField = "Name";
        ddlDivisionList.DataValueField = "Id";
        ddlDivisionList.DataBind();
    }

    protected void ddlSession_SelectedIndexChanged(object sender, EventArgs e)
    {
        BindDivisionList();
        TabContainer1.ActiveTabIndex = 1;
    }

    protected void ddlDivisionList_SelectedIndexChanged(object sender, EventArgs e)
    {
        bindCirteriaList();
    }

    public void bindCirteriaList()
    {
        SqlParameter[] param = new SqlParameter[3];
        param[0] = new SqlParameter("@type", "getCriteria");
        // param[1] = new SqlParameter("@SessionId", ddlSession.SelectedValue);
        param[2] = new SqlParameter("@DivisionId", ddlDivisionList.SelectedValue);
        DsKI = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pCriteriaMappingWithKeyIndicator", param);
        ddlCriteriaList.DataSource = DsKI;
        ddlCriteriaList.DataTextField = "Name";
        ddlCriteriaList.DataValueField = "Id";
        ddlCriteriaList.DataBind();
    }

    protected void ddlCriteriaList_SelectedIndexChanged(object sender, EventArgs e)
    {
        TabContainer1.ActiveTabIndex = 1;
    }

    public void clear()
    {

    }

    protected void btnResetMapping_Click(object sender, EventArgs e)
    {
        clear();
    }


    protected void rblIndicatorOption_SelectedIndexChanged(object sender, EventArgs e)
    {
        if (rblIndicatorOption.SelectedValue == "S")
        {
            KeyMultiple.Visible = false;
            KeySingle.Visible = true;
            //KeySingle1.Visible = true;
            //KeySingle2.Visible = true;
            TRKeyOfflinePnl.Visible = false;
            btnSaveKI.Visible = true;
        }
        else
        {
            KeyMultiple.Visible = true;
            KeySingle.Visible = false;
            //KeySingle1.Visible = false;
            // KeySingle2.Visible = false;
            TRKeyOfflinePnl.Visible = true;
            btnSaveKI.Visible = false;
        }
        grdKIUpload.DataBind();
        TabContainer1.ActiveTabIndex = 1;
    }

    protected void btnKeyUpload_Click(object sender, EventArgs e)
    {

    }

    protected void btnKeyUpload_Click1(object sender, EventArgs e)
    {
        TabContainer1.ActiveTabIndex = 1;
        ArrayList errorList;
        errorList = new ArrayList();
        DataTable dt; dt = new DataTable();
        bool isError;
        isError = false;
        if (fuKeyUpload.HasFile)
        {
            if (System.IO.Path.GetExtension(fuKeyUpload.FileName) == ".xls")
            {
                string FileName = Guid.NewGuid().ToString() + Path.GetFileName(fuKeyUpload.PostedFile.FileName);

                string Extension = Path.GetExtension(fuKeyUpload.PostedFile.FileName);
                string FolderPath = ConfigurationManager.AppSettings["FolderPath"];
                strPath = Server.MapPath(FolderPath + "/" + FileName);

                fuKeyUpload.SaveAs(strPath);
                dt = ExcelLibrary.DataSetHelper.CreateDataTable(strPath, "Sheet1");

                for (int i = 0; i < dt.Rows.Count; i++)
                {
                    //if (Convert.ToInt32(dt.Rows[i]["Weightage"]) < 0)
                    //{
                    //    errorList.Add(" Invalid Value in Row- " + (i + 1) + " Column-Weightage");
                    //    isError = true;
                    //}
                    if (System.Text.RegularExpressions.Regex.IsMatch(dt.Rows[i]["KeyIndicator"].ToString(),
                                            "^[ A-Za-z0-9-&()]*$") != true)
                    {
                        errorList.Add(" Invalid Value in Row- " + (i + 1) + " Special characters are not allowed, except -()& Column-KeyIndicator");
                        isError = true;

                    }


                }

                if (isError)
                {
                    grdError2.DataSource = errorList;
                    grdError2.DataBind();
                    btnSaveKI.Visible = false;
                    grdKIUpload.DataSource = dt;
                    grdKIUpload.DataBind();
                    File.Delete(strPath);
                }
                else
                {
                    grdError2.DataSource = null;
                    grdError2.DataBind();
                    btnSaveKI.Visible = true;
                    grdKIUpload.DataSource = dt;
                    grdKIUpload.DataBind();
                    File.Delete(strPath);
                }
            }
            else
            {
                DisplayAJAXMessage(this, "Please upload only .xls extension file");
                return;
            }
        }
    }

    protected void btnSaveKI_Click(object sender, EventArgs e)
    {
        try
        {
            if (rblIndicatorOption.SelectedValue == "S")
            {
                con = new SqlConnection(constr);
                con.Open();
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandText = "pUploadOutComePlannerMaster";
                cmd.Connection = con;
                cmd.Parameters.AddWithValue("@type", "UploadKI");
                cmd.Parameters.AddWithValue("@IndicatorDescription", txtKeyIndicator.Text.Trim());
                //cmd.Parameters.AddWithValue("@IndicatorWeightage", txtIndicatorWeightage.Text);
                cmd.Parameters.AddWithValue("@LoginId", Session["LoginName"]);
                cmd.Parameters.AddWithValue("@CriteriaId", ddlCriteriaList.SelectedValue);
                //cmd.Parameters.AddWithValue("@SourceDescription", txtSource.Text);
                SqlDataAdapter da = new SqlDataAdapter("select * from KeyIndicatorMaster where CriteriaId=@CriteriaId and IndicatorDescription=@IndiDesc and IsActive=1", con);
                da.SelectCommand.Parameters.AddWithValue("@CriteriaId", ddlCriteriaList.SelectedValue);
                da.SelectCommand.Parameters.AddWithValue("@IndiDesc", txtKeyIndicator.Text.Trim());
                DataSet ds = new DataSet();
                da.Fill(ds);
                if (ds.Tables[0].Rows.Count > 0)
                {
                    DisplayAJAXMessage(this, "Indicator " + txtKeyIndicator.Text + " already exists in criteria " + ddlCriteriaList.SelectedItem.Text);
                    return;
                }
                else
                {
                    cmd.ExecuteNonQuery();
                    cmd.Dispose();
                    con.Close();
                    cmd.Parameters.Clear();
                    //txtIndicatorWeightage.Text = "";
                    txtKeyIndicator.Text = "";
                    DisplayAJAXMessage(this, "Successfully Submitted");
                    return;
                }
            }
            else
            {
                for (int i = 0; i < grdKIUpload.Rows.Count; i++)
                {
                    con = new SqlConnection(constr);
                    con.Open();
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandText = "pUploadOutComePlannerMaster";
                    cmd.Connection = con;
                    cmd.Parameters.AddWithValue("@type", "UploadKI");
                    cmd.Parameters.AddWithValue("@IndicatorDescription", (grdKIUpload.Rows[i].FindControl("lblKeyIndicator") as Label).Text.Trim());
                    // cmd.Parameters.AddWithValue("@IndicatorWeightage", (grdKIUpload.Rows[i].FindControl("lblWeightage") as Label).Text);
                    //cmd.Parameters.AddWithValue("@SourceDescription", (grdKIUpload.Rows[i].FindControl("lblSourceDescription") as Label).Text);
                    cmd.Parameters.AddWithValue("@LoginId", Session["LoginName"]);
                    cmd.Parameters.AddWithValue("@CriteriaId", ddlCriteriaList.SelectedValue);
                    SqlDataAdapter da = new SqlDataAdapter("select * from KeyIndicatorMaster where CriteriaId=@CriteriaId and IndicatorDescription=@IndiDesc and Isactive=1", con);
                    da.SelectCommand.Parameters.AddWithValue("@CriteriaId", ddlCriteriaList.SelectedValue);
                    da.SelectCommand.Parameters.AddWithValue("@IndiDesc", txtKeyIndicator.Text.Trim());
                    DataSet ds = new DataSet();
                    da.Fill(ds);
                    if (ds.Tables[0].Rows.Count > 0)
                    {
                        DisplayAJAXMessage(this, "Indicator " + (grdKIUpload.Rows[i].FindControl("lblKeyIndicator") as Label).Text + " already exists in criteria " + ddlCriteriaList.SelectedItem.Text);
                        return;
                    }
                    else
                    {
                        cmd.ExecuteNonQuery();
                        cmd.Dispose();
                        con.Close();
                        cmd.Parameters.Clear();
                    }
                }

                grdKIUpload.DataBind();
                DisplayAJAXMessage(this, "Successfully Submitted");
                return;
            }
        }
        catch (Exception ex)
        {
            lblerror.Text = "Error '" + ex.Message + "' '" + ex.Source + "' ";
            DisplayAJAXMessage(this, lblerror.Text);
        }
    }

    protected void ddlSessionMetric_SelectedIndexChanged(object sender, EventArgs e)
    {

    }

    protected void ddlDivisionMetric_SelectedIndexChanged(object sender, EventArgs e)
    {
        bindcriteriaM();
        lblSelectedValues.Text = "";
        if (ddlDivisionMetric.SelectedValue.ToString() == "213")     //11_02_2025
        {
            trAccredobs.Visible = true;
            //foreach (ListItem item in ddlDivisionMetric.Items)
            //{
            //    // Add each item to ListBox
            //    rptCheckBoxList.Items.Add(new ListItem(item.Text, item.Value));
            //}

            SqlParameter[] param = new SqlParameter[2];
            param[0] = new SqlParameter("@type", "getDivision");
            param[1] = new SqlParameter("@LoginId", Session["LoginName"]);
            DsDivision = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pSaveCriteria", param);
            //lblMultiSelect.DataSource = DsDivision;
            //lblMultiSelect.DataTextField = "Name";
            //lblMultiSelect.DataValueField = "Id";
            //lblMultiSelect.DataBind();
            //lblMultiSelect.Visible = true;

            RadComboBox1.DataSource = DsDivision;
            RadComboBox1.DataTextField = "Name";  // Assuming Name is the display column
            RadComboBox1.DataValueField = "Id";  // Assuming Id is the value column
            RadComboBox1.DataBind();

            //rptCheckBoxList.DataSource = DsDivision;
            //rptCheckBoxList.DataBind();
        }
        else
        {
            trAccredobs.Visible = false;
        }


    }

    protected void RadComboBox1_SelectedIndexChanged(object sender, Telerik.Web.UI.RadComboBoxSelectedIndexChangedEventArgs e)
    {
        var selectedValues = RadComboBox1.CheckedItems.Select(item => item.Text).ToList();
        lblSelectedValues.Text = "" + string.Join(", ", selectedValues);
    }
    protected void lblMultiSelect_SelectedIndexChanged(object sender, EventArgs e)      //11_02_2025
    {

        //var selectedValues = lblMultiSelect.Items.Cast<ListItem>()
        //                                        .Where(item => item.Selected)
        //                                        .Select(item => item.Text)
        //                                        .ToList();

        //string selectedValuesText = string.Join(", ", selectedValues);

        //lblverifications.Text = "Verification Divisions: " + selectedValuesText;
    }
    public void bindcriteriaM()
    {
        try
        {
            DataSet DsCriteriaMetric = new DataSet();

            SqlParameter[] param = new SqlParameter[2];
            param[0] = new SqlParameter("@type", "GetCriteria");
            param[1] = new SqlParameter("@DivisionId", ddlDivisionMetric.SelectedValue);
            // param[2] = new SqlParameter("@SessionId", ddlSessionMetric.SelectedValue);
            DsCriteriaMetric = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pGetKeyIndicatorMaster", param);
            ddlCriteriaMetric.DataSource = DsCriteriaMetric;
            ddlCriteriaMetric.DataTextField = "Name";
            ddlCriteriaMetric.DataValueField = "Id";
            ddlCriteriaMetric.DataBind();
            lnkExportMetric.Visible = true;
        }
        catch (Exception ex)
        {

        }

    }

    protected void ddlCriteriaMetric_SelectedIndexChanged(object sender, EventArgs e)
    {
        DataSet DsKiMetric = new DataSet();

        SqlParameter[] param = new SqlParameter[2];
        param[0] = new SqlParameter("@type", "GetKI");
        param[1] = new SqlParameter("@CriteriaId", ddlCriteriaMetric.SelectedValue);
        DsKiMetric = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pGetKeyIndicatorMaster", param);
        ddlKiMetric.DataSource = DsKiMetric;
        ddlKiMetric.DataTextField = "Name";
        ddlKiMetric.DataValueField = "Id";
        ddlKiMetric.DataBind();
        TabContainer1.ActiveTabIndex = 2;
        // BindAccreditation();
    }

    protected void ddlCriteriaSession_SelectedIndexChanged(object sender, EventArgs e)
    {
        bindDsDivision();
        TabContainer1.ActiveTabIndex = 0;
    }

    public void bindDsDivision()
    {
        SqlParameter[] param = new SqlParameter[2];
        param[0] = new SqlParameter("@type", "getDivision");
        param[1] = new SqlParameter("@LoginId", Session["LoginName"]);
        DsDivision = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pSaveCriteria", param);
        ddlCriteriaDivision.DataSource = DsDivision;
        ddlCriteriaDivision.DataTextField = "Name";
        ddlCriteriaDivision.DataValueField = "Id";
        ddlCriteriaDivision.DataBind();

        lnkExportCriteria.Visible = true;
    }

    protected void ddlSession_SelectedIndexChanged1(object sender, EventArgs e)
    {
        BindDivisionListKi();
        TabContainer1.ActiveTabIndex = 1;
    }

    public void BindDivisionListKi()
    {
        SqlParameter[] param = new SqlParameter[2];
        param[0] = new SqlParameter("@type", "getFilledDivisionList");
        //param[1] = new SqlParameter("@SessionId", ddlSession.SelectedValue);
        param[1] = new SqlParameter("@LoginId", Session["LoginName"]);
        DsDivision = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pSaveCriteria", param);
        ddlDivisionList.DataSource = DsDivision;
        ddlDivisionList.DataTextField = "Name";
        ddlDivisionList.DataValueField = "Id";
        ddlDivisionList.DataBind();
        lnkExportKi.Visible = true;
    }

    //protected void ddlSessionMetric_SelectedIndexChanged1(object sender, EventArgs e)
    //{
    //    bindDivList();
    //    TabContainer1.ActiveTabIndex = 2;
    //}
    public void bindDivList()
    {
        SqlParameter[] param = new SqlParameter[2];
        param[0] = new SqlParameter("@type", "getFilledDivisionList");
        param[1] = new SqlParameter("@LoginId", Session["LoginName"]);
        DsDivision = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pSaveCriteria", param);
        ddlDivisionMetric.DataSource = DsDivision;
        ddlDivisionMetric.DataTextField = "Name";
        ddlDivisionMetric.DataValueField = "Id";
        ddlDivisionMetric.DataBind();
        lnkExportMetric.Visible = true;

    }

    protected void rblMetricOptions_SelectedIndexChanged(object sender, EventArgs e)
    {


        if (rblMetricOptions.SelectedValue == "S")
        {
            MetricSingle1.Visible = true;
            MetricSingle2.Visible = true;
            // MetricSingle3.Visible = true;
            MetricSingle4.Visible = true;
            MetricSingleExclusive.Visible = true;
            MetricMultiple.Visible = false;
            btnSaveMetric.Visible = true;
            TRMetricOfflinePnl.Visible = false;
            MetricCategory.Visible = true;
            MetricCategory.Visible = true;
            MetricFinalDivision.Visible = true;
            MetricSourceLevel.Visible = true;
            MetricSchoolLevel.Visible = true;
            MetricDivLevel.Visible = true;
            MetricOldReferenceMetricId.Visible = true;
            QuarterWiseMetricDiscussion.Visible = true;
        }
        else
        {
            MetricSingle1.Visible = false;
            MetricSingle2.Visible = false;
            //MetricSingle3.Visible = false;
            MetricSingle4.Visible = false;
            MetricSingleExclusive.Visible = false;
            MetricMultiple.Visible = true;
            btnSaveMetric.Visible = false;
            TRMetricOfflinePnl.Visible = true;
            MetricCategory.Visible = false;
            MetricFinalDivision.Visible = false;
            MetricSourceLevel.Visible = true;
            MetricSchoolLevel.Visible = true;
            MetricDivLevel.Visible = true;
            MetricOldReferenceMetricId.Visible = false;
            QuarterWiseMetricDiscussion.Visible = false;
        }
        grdMetricUpload.DataBind();
        TabContainer1.ActiveTabIndex = 2;
    }

    protected void btnResetKi_Click(object sender, EventArgs e)
    {
        ddlDivisionList.SelectedIndex = 0;
        ddlCriteriaList.SelectedIndex = 0;
        rblIndicatorOption.ClearSelection();
        txtKeyIndicator.Text = "";
        //txtIndicatorWeightage.Text = "";
        lblerror.Text = "";
    }

    protected void btnResetMetric_Click(object sender, EventArgs e)
    {

        ddlDivisionMetric.SelectedIndex = 0;
        ddlCriteriaMetric.SelectedIndex = 0;
        ddlKiMetric.SelectedIndex = 0;
        rblMetricOptions.ClearSelection();
        txtMeric.Text = "";
        txtFormula.Text = "";
        //txtMetricWeightage.Text = "";
        lblError1.Text = "";
        grdError3.DataBind();
        grdMetricUpload.DataBind();
    }

    protected void btnSaveMetric_Click(object sender, EventArgs e)

    {
        string selectedValuesStr = "";
        if (ddlSourceDivLevel.SelectedValue == "Select" && ddlSchoolLevel.SelectedValue == "Select" && ddlDivisionLevel.SelectedValue == "Select")
        {
            DisplayAJAXMessage(this, "Please select one of allocation up to level from source,school and division");
            return;
        }

        if (ddlDivisionMetric.SelectedValue.ToString() == "213")     //13_02_2025
        {
            var selectedValues = RadComboBox1.CheckedItems.Select(item => item.Value).ToList();
            selectedValuesStr = string.Join(",", selectedValues);
        }

        try
        {
            if (rblMetricOptions.SelectedValue == "S")
            {
                con = new SqlConnection(constr);
                con.Open();
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandText = "pUploadOutComePlannerMaster";
                cmd.Connection = con;
                cmd.Parameters.AddWithValue("@type", "UploadMetric");
                cmd.Parameters.AddWithValue("@MetricDescription", txtMeric.Text.Trim());
                cmd.Parameters.AddWithValue("@MetricFormula", txtFormula.Text.Trim());
                cmd.Parameters.AddWithValue("@IndicatorId", ddlKiMetric.SelectedValue);
                cmd.Parameters.AddWithValue("@MetricPriority", rdlMetricPriority.SelectedValue);
                cmd.Parameters.AddWithValue("@MeetingQuarter1", chkLstMetricDiscussion.Items[0].Selected);
                cmd.Parameters.AddWithValue("@MeetingQuarter2", chkLstMetricDiscussion.Items[1].Selected);
                cmd.Parameters.AddWithValue("@MeetingQuarter3", chkLstMetricDiscussion.Items[2].Selected);
                cmd.Parameters.AddWithValue("@MeetingQuarter4", chkLstMetricDiscussion.Items[3].Selected);

                cmd.Parameters.AddWithValue("@LoginId", Session["LoginName"]);
                cmd.Parameters.AddWithValue("@MetricType", rblHasStages.SelectedValue);
                cmd.Parameters.AddWithValue("@MetricCategory", rdlMetricCategory.SelectedValue);
                if (ddlFinal.SelectedValue != "Select")
                    cmd.Parameters.AddWithValue("@FinalVerificationDivId", ddlFinal.SelectedValue);
                else
                    cmd.Parameters.AddWithValue("@FinalVerificationDivId", DBNull.Value);
                if (ddlSourceDivLevel.SelectedValue != "Select")
                    cmd.Parameters.AddWithValue("@SrcDivisionLevel", ddlSourceDivLevel.SelectedValue);
                else
                    cmd.Parameters.AddWithValue("@SrcDivisionLevel", DBNull.Value);
                if (ddlSchoolLevel.SelectedValue != "Select")
                    cmd.Parameters.AddWithValue("@SchoolLevel", ddlSchoolLevel.SelectedValue);
                else
                    cmd.Parameters.AddWithValue("@SchoolLevel", DBNull.Value);
                if (ddlDivisionLevel.SelectedValue != "Select")
                    cmd.Parameters.AddWithValue("@DivisionLevel", ddlDivisionLevel.SelectedValue);
                else
                    cmd.Parameters.AddWithValue("@DivisionLevel", DBNull.Value);

                if (IsMandatory.SelectedValue != "0")
                    cmd.Parameters.AddWithValue("@IsMandatory", IsMandatory.SelectedValue);
                else
                    cmd.Parameters.AddWithValue("@IsMandatory", DBNull.Value);

                cmd.Parameters.AddWithValue("@IsExclusive", rbtnMarkExclusive.SelectedValue == "1" ? true : false);
                cmd.Parameters.AddWithValue("@UmsPath", txtUmsPath.Text == "" ? (object)DBNull.Value : txtUmsPath.Text);                
                cmd.Parameters.AddWithValue("@AccreditationVerficationDivisions", selectedValuesStr == "" ? (object)DBNull.Value : selectedValuesStr);     //13_02_2025
                
                //DisplayAJAXMessage(this, txtUmsPath.Text+ " Mandatory "+ IsMandatory.SelectedValue);
                cmd.ExecuteNonQuery();

                cmd.Dispose();
                con.Close();
                cmd.Parameters.Clear();
                txtMeric.Text = "";
                txtFormula.Text = "";
                //// txtMetricWeightage.Text = "";
                DisplayAJAXMessage(this, "Successfully Submitted");
                return;
            }
            else
            {
                for (int i = 0; i < grdMetricUpload.Rows.Count; i++)
                {
                    con = new SqlConnection(constr);
                    con.Open();
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandText = "pUploadOutComePlannerMaster";
                    cmd.Connection = con;
                    cmd.Parameters.AddWithValue("@type", "UploadMetric");
                    cmd.Parameters.AddWithValue("@MetricDescription", (grdMetricUpload.Rows[i].FindControl("lblMetric") as Label).Text.Trim());
                    cmd.Parameters.AddWithValue("@MetricFormula", (grdMetricUpload.Rows[i].FindControl("lblFormula") as Label).Text.Trim());
                    cmd.Parameters.AddWithValue("@MetricPriority", (grdMetricUpload.Rows[i].FindControl("lblMetricPriority") as Label).Text.Trim());
                    if ((grdMetricUpload.Rows[i].FindControl("lblMetricQuarter1") as Label).Text.Trim() == "1")
                    {
                        cmd.Parameters.AddWithValue("@MeetingQuarter1", 1);
                    }
                    else
                    {
                        cmd.Parameters.AddWithValue("@MeetingQuarter1", 0);
                    }
                    if ((grdMetricUpload.Rows[i].FindControl("lblMetricQuarter2") as Label).Text.Trim() == "1")
                    {
                        cmd.Parameters.AddWithValue("@MeetingQuarter2", 1);
                    }
                    else
                    {
                        cmd.Parameters.AddWithValue("@MeetingQuarter2", 0);
                    }
                    if ((grdMetricUpload.Rows[i].FindControl("lblMetricQuarter3") as Label).Text.Trim() == "1")
                    {
                        cmd.Parameters.AddWithValue("@MeetingQuarter3", 1);
                    }
                    else
                    {
                        cmd.Parameters.AddWithValue("@MeetingQuarter3", 0);
                    }
                    if ((grdMetricUpload.Rows[i].FindControl("lblMetricQuarter4") as Label).Text.Trim() == "1")
                    {
                        cmd.Parameters.AddWithValue("@MeetingQuarter4", 1);
                    }
                    else
                    {
                        cmd.Parameters.AddWithValue("@MeetingQuarter4", 0);
                    }
                    cmd.Parameters.AddWithValue("@FinalVerificationDivId", (grdMetricUpload.Rows[i].FindControl("lblFinalVerificationDivision") as Label).Text); // 12/08/2024  Added FinalVerificationDivId in case of Multiple Entry
                    //cmd.Parameters.AddWithValue("@MetricWeightage", (grdMetricUpload.Rows[i].FindControl("lblWeightage") as Label).Text);
                    cmd.Parameters.AddWithValue("@IndicatorId", ddlKiMetric.SelectedValue);
                    cmd.Parameters.AddWithValue("@LoginId", Session["LoginName"]);
                    cmd.Parameters.AddWithValue("@MetricType", "M");
                    cmd.Parameters.AddWithValue("@MetricCategory", (grdMetricUpload.Rows[i].FindControl("lblMetricCategory") as Label).Text);
                    if (ddlSourceDivLevel.SelectedValue != "Select")
                        cmd.Parameters.AddWithValue("@SrcDivisionLevel", ddlSourceDivLevel.SelectedValue);
                    else
                        cmd.Parameters.AddWithValue("@SrcDivisionLevel", DBNull.Value);
                    if (ddlSchoolLevel.SelectedValue != "Select")
                        cmd.Parameters.AddWithValue("@SchoolLevel", ddlSchoolLevel.SelectedValue);
                    else
                        cmd.Parameters.AddWithValue("@SchoolLevel", DBNull.Value);
                    if (ddlDivisionLevel.SelectedValue != "Select")
                        cmd.Parameters.AddWithValue("@DivisionLevel", ddlDivisionLevel.SelectedValue);
                    else
                        cmd.Parameters.AddWithValue("@DivisionLevel", DBNull.Value);

                    if ((grdMetricUpload.Rows[i].FindControl("lblIsMandatory") as Label).Text.Trim() == "1")
                        cmd.Parameters.AddWithValue("@IsMandatory",1);
                    else
                        cmd.Parameters.AddWithValue("@IsMandatory", 0);
                   
                    cmd.Parameters.AddWithValue("@UmsPath", (grdMetricUpload.Rows[i].FindControl("lblUMSPath") as Label).Text.Trim());

                    cmd.ExecuteNonQuery();
                    cmd.Dispose();
                    con.Close();
                    cmd.Parameters.Clear();
                }

                grdMetricUpload.DataBind();
                DisplayAJAXMessage(this, "Successfully Submitted");
                return;
            }
        }
        catch (Exception ex)
        {
            string Msg = ex.Message.ToString();
            Msg = Msg.Replace("'", "");
            Msg = Msg.Replace("\r\n", "");
            lblError1.Text = "Error '" + ex.Message + "' '" + ex.Source + "' ";
            DisplayAJAXMessage(this, Msg);
        }
    }
    protected void btnSaveAccre_Click(object sender, EventArgs e)
    {

        if (lstAccreditationSubPoints1.Items.Count > 0)
        {
            int subpointscount1 = 0;
            foreach (ListItem li in lstAccreditationSubPoints1.Items)
            {
                if (li.Selected == true)
                    subpointscount1++;
            }
            if (subpointscount1 == 0)
            {
                DisplayAJAXMessage(this, "Please select subpoints");
                return;
            }
        }
        else if (lstAccreditationSubPoints.Items.Count > 0)
        {
            int subpointscount = 0;
            foreach (ListItem li in lstAccreditationSubPoints.Items)
            {
                if (li.Selected == true)
                    subpointscount++;
            }
            if (subpointscount == 0)
            {
                DisplayAJAXMessage(this, "Please select subpoints");
                return;
            }
        }
        else if (lstAccreditationMain.Items.Count > 0)
        {
            int Maincount = 0;
            foreach (ListItem li in lstAccreditationMain.Items)
            {
                if (li.Selected == true)
                    Maincount++;
            }
            if (Maincount == 0)
            {
                DisplayAJAXMessage(this, "Please select Accreditation points");
                return;
            }
        }
        else if (lstAccreditation.Items.Count > 0)
        {
            int Accreditation = 0;
            foreach (ListItem li in lstAccreditation.Items)
            {
                if (li.Selected == true)
                    Accreditation++;
            }
            if (Accreditation == 0)
                DisplayAJAXMessage(this, "Please select Accreditation Body");
            return;
        }
        XmlDocument doc = new XmlDocument();
        string CS = ConfigurationManager.ConnectionStrings["NewUMSConnectionString"].ConnectionString;


        XmlDeclaration declaire = doc.CreateXmlDeclaration("1.0", "utf-16", null);
        // -----------------------create root-----------------------------  
        XmlElement rootnode = doc.CreateElement("root");
        doc.InsertBefore(declaire, doc.DocumentElement);
        doc.AppendChild(rootnode);
        var list = new ListItemCollection();
        if (lstAccreditationSubPoints1.Items.Count > 0)
            list = lstAccreditationSubPoints1.Items;
        else if (lstAccreditationSubPoints.Items.Count > 0)
            list = lstAccreditationSubPoints.Items;
        else if (lstAccreditationMain.Items.Count > 0)
            list = lstAccreditationMain.Items;
        else
            list = lstAccreditation.Items;

        foreach (ListItem li in list)
        {
            XmlElement AccreditationData = doc.CreateElement("AccreditationData");
            if (li.Selected == true)
            {
                XmlElement AccreditationPointId = doc.CreateElement("AccreditationPointId");
                AccreditationPointId.InnerText = li.Value;
                AccreditationData.AppendChild(AccreditationPointId);
                doc.DocumentElement.AppendChild(AccreditationData);
            }

        }
        //foreach(string parentpointId in ParentPointIds)
        //{
        //    XmlElement AccreditationData = doc.CreateElement("AccreditationData");
        //    XmlElement AccreditationPointId = doc.CreateElement("AccreditationPointId");
        //    AccreditationPointId.InnerText = parentpointId;
        //    AccreditationData.AppendChild(AccreditationPointId);
        //    doc.DocumentElement.AppendChild(AccreditationData);
        //}
        try
        {
            con = new SqlConnection(constr);
            con.Open();
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "pSaveMetricAccreditationSource";
            cmd.Connection = con;
            cmd.Parameters.AddWithValue("@MetricId", ddlMetricAccre.SelectedValue);
            cmd.Parameters.AddWithValue("@EntryBy", Session["LoginName"].ToString());
            cmd.Parameters.AddWithValue("@XMLTable", doc.InnerXml.ToString());
            cmd.ExecuteNonQuery();
            con.Close();
            ParentPointIds.Clear();
            DisplayAJAXMessage(this, "Successfully Submitted...");
            //clearing the listboxes of accreditation source
            lstAccreditationMain.Items.Clear();
            lstAccreditationSubPoints.Items.Clear();
            lstAccreditationSubPoints1.Items.Clear();
            lstAccreditationMain.Visible = false;
            lstAccreditationSubPoints.Visible = false;
            lstAccreditationSubPoints1.Visible = false;
            return;

        }
        catch (Exception ex)
        {

        }

    }
    protected void btnSaveWeightage_Click(object sender, EventArgs e)
    {
        try
        {
            con = new SqlConnection(constr);
            con.Open();
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "pInsertMetricWeightage";
            cmd.Connection = con;
            //cmd.Parameters.AddWithValue("@MetricId", ddlMetricWeightage.SelectedValue);
            cmd.Parameters.AddWithValue("@EntryBy", Session["LoginName"].ToString());
            //cmd.Parameters.AddWithValue("@Weightage", txtMetricWeightage1.Text);
            cmd.Parameters.AddWithValue("@PlannerSessionId", ddlSessionWeightage.SelectedValue);
            cmd.ExecuteNonQuery();
            con.Close();
            DisplayAJAXMessage(this, "Successfully Submitted...");
            return;

        }
        catch (Exception ex)
        {

        }


    }
    //protected void btnSaveKeyWeightage_Click(object sender, EventArgs e)
    //{
    //    try
    //    {
    //        con = new SqlConnection(constr);
    //        con.Open();
    //        cmd.CommandType = CommandType.StoredProcedure;
    //        cmd.CommandText = "pInsertIndicatorWeightage";
    //        cmd.Connection = con;
    //        //cmd.Parameters.AddWithValue("@MetricId", ddlMetricWeightage.SelectedValue);
    //        cmd.Parameters.AddWithValue("@EntryBy", Session["LoginName"].ToString());
    //        //cmd.Parameters.AddWithValue("@Weightage", txtMetricWeightage1.Text);
    //        cmd.Parameters.AddWithValue("@PlannerSessionId", ddlSessionWeightage.SelectedValue);
    //        cmd.ExecuteNonQuery();
    //        con.Close();
    //        DisplayAJAXMessage(this, "Successfully Submitted...");
    //        return;

    //    }
    //    catch (Exception ex)
    //    {

    //    }


    //}
    protected void btnMetricUpload_Click(object sender, EventArgs e)
    {
        TabContainer1.ActiveTabIndex = 2;
        ArrayList errorList;
        errorList = new ArrayList();
        DataTable dt; dt = new DataTable();
        bool isError;
        isError = false;
        bool columnexist = false;
        if (fuMetricUpload.HasFile)
        {
            if (System.IO.Path.GetExtension(fuMetricUpload.FileName) == ".xls" || System.IO.Path.GetExtension(fuMetricUpload.FileName) == ".xlsx")
            {
                string FileName = Guid.NewGuid().ToString() + Path.GetFileName(fuMetricUpload.PostedFile.FileName);
                string Extension = Path.GetExtension(fuMetricUpload.PostedFile.FileName);
                string FolderPath = ConfigurationManager.AppSettings["FolderPath"];
                strPath = Server.MapPath(FolderPath + "/" + FileName);
                fuMetricUpload.SaveAs(strPath);
                //  dt = ExcelLibrary.DataSetHelper.CreateDataTable(strPath, "Sheet1");  Commented on 14_08_2024

                //************14_08_2024*****************

                using (XLWorkbook workbook = new XLWorkbook(strPath))
                {
                    IXLWorksheet worksheet = workbook.Worksheet(1);
                    bool FirstRow = true;
                    // Range for reading the cells based on the last cell used.
                    string readRange = "1:1";
                    foreach (IXLRow row in worksheet.RowsUsed())
                    {
                        // If Reading the First Row (used) then add them as column name
                        if (FirstRow)
                        {
                            // Checking the Last cell used for column generation in datatable
                            readRange = string.Format("{0}:{1}", 1, row.LastCellUsed().Address.ColumnNumber);
                            foreach (IXLCell cell in row.Cells(readRange))
                            {
                                dt.Columns.Add(cell.Value.ToString());
                            }
                            FirstRow = false;
                        }
                        else
                        {
                            // Adding a Row in datatable
                            dt.Rows.Add();
                            int cellIndex = 0;
                            // Updating the values of datatable
                            foreach (IXLCell cell in row.Cells(readRange))
                            {
                                dt.Rows[dt.Rows.Count - 1][cellIndex] = cell.Value.ToString();
                                cellIndex++;
                            }
                        }
                    }
                }

                //**********13/08/2024*********************
                if (dt.Columns.Contains("FinalVerificationDivision") && dt.Columns.Contains("MetricDescription") && dt.Columns.Contains("MetricFormula") && dt.Columns.Contains("MetricCategory") && dt.Columns.Contains("MetricPriority") && dt.Columns.Contains("MetricQuarter1") && dt.Columns.Contains("MetricQuarter2") && dt.Columns.Contains("MetricQuarter3") && dt.Columns.Contains("MetricQuarter4") && dt.Columns.Contains("IsMandatory") && dt.Columns.Contains("UMSPath")   )
                {
                    columnexist = true;
                }
                if (columnexist == false)
                {
                    errorList.Add("One of the Columns is mismatched/notexisted in Sheet. Kindly check Format for ColumnHeadings");
                    isError = true;
                }
                //**********13/08/2024*********************
                for (int i = 0; i < dt.Rows.Count; i++)
                {
                    //if (Convert.ToInt32(dt.Rows[i]["MetricWeightage"]) < 0)
                    //{
                    //    errorList.Add(" Invalid Value in Row- " + (i + 1) + " Column-MetricWeightage");
                    //    isError = true;
                    //}
                    if (System.Text.RegularExpressions.Regex.IsMatch(dt.Rows[i]["MetricDescription"].ToString(),
                                            "^[ A-Za-z0-9-&()+:,.%/]*$") != true)
                    {
                        errorList.Add(" Invalid Value in Row- " + (i + 1) + " Special characters are not allowed, except +-()&:,.%/ Column-MetricDescription ");
                        isError = true;

                    }
                    //else if (dt.Rows[i]["MetricType"].ToString().ToUpper() != "M" && dt.Rows[i]["MetricType"].ToString().ToUpper() != "P")
                    //{
                    //    errorList.Add(" Invalid Value in Row- " + (i + 1) + " Column-MetricType ");
                    //    isError = true;
                    //}
                    else if (dt.Rows[i]["MetricCategory"].ToString().ToUpper() != "A" && dt.Rows[i]["MetricCategory"].ToString().ToUpper() != "B" && dt.Rows[i]["MetricCategory"].ToString().ToUpper() != "AB" && dt.Rows[i]["MetricCategory"].ToString().ToUpper() != "C")
                    {
                        errorList.Add(" Invalid Value in Row- " + (i + 1) + " Column-Category ");
                        isError = true;
                    }
                    else if (Convert.ToChar(dt.Rows[i]["MetricPriority"]) != 'L' && Convert.ToChar(dt.Rows[i]["MetricPriority"]) != 'M' && Convert.ToChar(dt.Rows[i]["MetricPriority"]) != 'H')
                    {
                        errorList.Add(" Invalid Value in Row- " + (i + 1) + " Column-Priority ");
                        isError = true;
                    }
                    else if (Convert.ToString(dt.Rows[i]["FinalVerificationDivision"]) == "")
                    {
                        errorList.Add(" Invalid Value in Row- " + (i + 1) + " Column-FinalVerificationDivision");
                        isError = true;
                    }

                }

                if (isError)
                {
                    grdError3.DataSource = errorList;
                    grdError3.DataBind();
                    btnSaveMetric.Visible = false;
                    //  grdMetricUpload.DataSource = dt;           //Commented on 13_08_2024
                    //  grdMetricUpload.DataBind();
                    File.Delete(strPath);

                }
                else
                {

                    grdError3.DataSource = null;
                    grdError3.DataBind();
                    btnSaveMetric.Visible = true;
                    grdMetricUpload.DataSource = dt;
                    grdMetricUpload.DataBind();
                    File.Delete(strPath);

                }
            }
            else
            {
                DisplayAJAXMessage(this, "Please upload only .xls or xlsx extension file");
                return;
            }
        }
    }

    protected void btnResetAccre_Click(object sender, EventArgs e)
    {
        ddlDivisionAccrre.SelectedIndex = 0;
        ddlCriteriaAccrre.Items.Clear();
        ddlKiAccre.Items.Clear();
        ddlMetricAccre.Items.Clear();

        lstAccreditationMain.Items.Clear();
        lstAccreditationSubPoints.Items.Clear();
        lstAccreditationSubPoints1.Items.Clear();
        lstAccreditationMain.Visible = false;
        lstAccreditationSubPoints.Visible = false;
        lstAccreditationSubPoints1.Visible = false;
    }
    protected void btnResetWeightage_Click(object sender, EventArgs e)
    {
        ddlDivWeightage.SelectedIndex = 0;
        //trWeightage.Visible = false;
        ddlWeghtageCriteria.Items.Clear();
        ddlKeyWeightage.Items.Clear();
        //ddlMetricWeightage.Items.Clear();

    }
    protected void btnResetWeightageKey_Click(object sender, EventArgs e)
    {
        ddlDivKeyWeightage.SelectedIndex = 0;
        //trWeightage.Visible = false;
        ddlKeyWeghtageCriteria.Items.Clear();
        // ddlKeyWeightage.Items.Clear();
        //ddlMetricWeightage.Items.Clear();

    }
    protected void btnResetWeightageCriteria_Click(object sender, EventArgs e)
    {
        ddlDivCriteriaWeightage.SelectedIndex = 0;
        //trWeightage.Visible = false;
        // ddlKeyWeghtageCriteria.Items.Clear();
        // ddlKeyWeightage.Items.Clear();
        //ddlMetricWeightage.Items.Clear();

    }
    public void bindDivStages()
    {
        DataSet DsDivisionStages = new DataSet();
        SqlParameter[] param = new SqlParameter[2];
        param[0] = new SqlParameter("@type", "getFilledDivisionList");
        param[1] = new SqlParameter("@LoginId", Session["LoginName"]);
        DsDivisionStages = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pSaveCriteria", param);
        ddlDivisionStages.DataSource = DsDivisionStages;
        ddlDivisionStages.DataTextField = "Name";
        ddlDivisionStages.DataValueField = "Id";
        ddlDivisionStages.DataBind();
        ddlDivisionAccrre.DataSource = DsDivisionStages;
        ddlDivisionAccrre.DataTextField = "Name";
        ddlDivisionAccrre.DataValueField = "Id";
        ddlDivisionAccrre.DataBind();
        ddlDivWeightage.DataSource = DsDivisionStages;
        ddlDivWeightage.DataTextField = "Name";
        ddlDivWeightage.DataValueField = "Id";
        ddlDivWeightage.DataBind();
        ddlDivKeyWeightage.DataSource = DsDivisionStages;
        ddlDivKeyWeightage.DataTextField = "Name";
        ddlDivKeyWeightage.DataValueField = "Id";
        ddlDivKeyWeightage.DataBind();
        ddlDivCriteriaWeightage.DataSource = DsDivisionStages;
        ddlDivCriteriaWeightage.DataTextField = "Name";
        ddlDivCriteriaWeightage.DataValueField = "Id";
        ddlDivCriteriaWeightage.DataBind();
        lnkExportStages.Visible = true;

    }

    protected void ddlDivisionStages_SelectedIndexChanged(object sender, EventArgs e)
    {
        bindcriteriastages();
    }
    protected void ddlDivisionAccrre_SelectedIndexChanged(object sender, EventArgs e)
    {
        bindcriteriaAccree();
    }
    protected void ddlDivWeightage_SelectedIndexChanged(object sender, EventArgs e)
    {
        bindcriteriaweightage(ddlDivWeightage.SelectedValue, 0);
    }
    protected void ddlDivKeyWeightage_SelectedIndexChanged(object sender, EventArgs e)
    {
        bindcriteriaweightage(ddlDivKeyWeightage.SelectedValue, 1);
    }
    public void bindcriteriastages()
    {
        DataSet DsCriteriaStages = new DataSet();

        SqlParameter[] param = new SqlParameter[2];
        param[0] = new SqlParameter("@type", "GetCriteria");
        param[1] = new SqlParameter("@DivisionId", ddlDivisionStages.SelectedValue);
        DsCriteriaStages = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pGetKeyIndicatorMaster", param);
        ddlCriteriaStages.DataSource = DsCriteriaStages;
        ddlCriteriaStages.DataTextField = "Name";
        ddlCriteriaStages.DataValueField = "Id";
        ddlCriteriaStages.DataBind();
        lnkExportStages.Visible = true;

    }
    public void bindcriteriaweightage(string Div, int Type)
    {
        DataSet DsCriteriaStages = new DataSet();

        SqlParameter[] param = new SqlParameter[2];
        param[0] = new SqlParameter("@type", "GetCriteria");
        param[1] = new SqlParameter("@DivisionId", Div);
        DsCriteriaStages = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pGetKeyIndicatorMaster", param);
        if (Type == 0)
        {
            ddlWeghtageCriteria.DataSource = DsCriteriaStages;
            ddlWeghtageCriteria.DataTextField = "Name";
            ddlWeghtageCriteria.DataValueField = "Id";
            ddlWeghtageCriteria.DataBind();
        }
        else if (Type == 1)
        {
            ddlKeyWeghtageCriteria.DataSource = DsCriteriaStages;
            ddlKeyWeghtageCriteria.DataTextField = "Name";
            ddlKeyWeghtageCriteria.DataValueField = "Id";
            ddlKeyWeghtageCriteria.DataBind();
        }


    }
    public void bindcriteriaAccree()
    {
        DataSet DsCriteriaStages = new DataSet();

        SqlParameter[] param = new SqlParameter[2];
        param[0] = new SqlParameter("@type", "GetCriteria");
        param[1] = new SqlParameter("@DivisionId", ddlDivisionAccrre.SelectedValue);
        DsCriteriaStages = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pGetKeyIndicatorMaster", param);
        ddlCriteriaAccrre.DataSource = DsCriteriaStages;
        ddlCriteriaAccrre.DataTextField = "Name";
        ddlCriteriaAccrre.DataValueField = "Id";
        ddlCriteriaAccrre.DataBind();

    }
    protected void ddlCriteriaStages_SelectedIndexChanged(object sender, EventArgs e)
    {
        if (ddlCriteriaStages.SelectedValue != "Select")
        {
            DataSet DsKiStages = new DataSet();

            SqlParameter[] param = new SqlParameter[2];
            param[0] = new SqlParameter("@type", "GetKI");
            param[1] = new SqlParameter("@CriteriaId", ddlCriteriaStages.SelectedValue);
            DsKiStages = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pGetKeyIndicatorMaster", param);
            ddlKiStages.DataSource = DsKiStages;
            ddlKiStages.DataTextField = "Name";
            ddlKiStages.DataValueField = "Id";
            ddlKiStages.DataBind();
            TabContainer1.ActiveTabIndex = 3;
        }
    }
    protected void ddlCriteriaAccrre_SelectedIndexChanged(object sender, EventArgs e)
    {
        if (ddlCriteriaAccrre.SelectedValue != "Select")
        {
            DataSet DsKiStages = new DataSet();

            SqlParameter[] param = new SqlParameter[2];
            param[0] = new SqlParameter("@type", "GetKI");
            param[1] = new SqlParameter("@CriteriaId", ddlCriteriaAccrre.SelectedValue);
            DsKiStages = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pGetKeyIndicatorMaster", param);
            ddlKiAccre.DataSource = DsKiStages;
            ddlKiAccre.DataTextField = "Name";
            ddlKiAccre.DataValueField = "Id";
            ddlKiAccre.DataBind();
            TabContainer1.ActiveTabIndex = 4;
        }
    }

    protected void ddlWeghtageCriteria_SelectedIndexChanged(object sender, EventArgs e)
    {
        if (ddlWeghtageCriteria.SelectedValue != "Select")
        {
            DataSet DsKiStages = new DataSet();

            SqlParameter[] param = new SqlParameter[2];
            param[0] = new SqlParameter("@type", "GetKI");
            param[1] = new SqlParameter("@CriteriaId", ddlWeghtageCriteria.SelectedValue);
            DsKiStages = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pGetKeyIndicatorMaster", param);
            ddlKeyWeightage.DataSource = DsKiStages;
            ddlKeyWeightage.DataTextField = "Name";
            ddlKeyWeightage.DataValueField = "Id";
            ddlKeyWeightage.DataBind();
            //TabContainer1.ActiveTabIndex = 4;
        }
    }


    protected void ddlKiStages_SelectedIndexChanged(object sender, EventArgs e)
    {
        if (ddlKiStages.SelectedValue != "Select")
        {
            DataSet DsStageMetric = new DataSet();

            SqlParameter[] param = new SqlParameter[2];
            param[0] = new SqlParameter("@type", "GetMetric");
            param[1] = new SqlParameter("@KiId", ddlKiStages.SelectedValue);
            DsStageMetric = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pGetKeyIndicatorMaster", param);
            ddlStageMetric.DataSource = DsStageMetric;
            ddlStageMetric.DataTextField = "Name";
            ddlStageMetric.DataValueField = "Id";
            ddlStageMetric.DataBind();
            TabContainer1.ActiveTabIndex = 3;

        }
    }
    //protected void    (object sender, EventArgs e)
    //{
    //    if (ddlKeyWeightage.SelectedValue != "Select")
    //    {
    //        DataSet DsStageMetric = new DataSet();

    //        SqlParameter[] param = new SqlParameter[2];
    //        param[0] = new SqlParameter("@type", "GetMetric");
    //        param[1] = new SqlParameter("@KiId", ddlKeyWeightage.SelectedValue);
    //        DsStageMetric = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pGetKeyIndicatorMaster", param);
    //        ddlMetricWeightage.DataSource = DsStageMetric;
    //        ddlMetricWeightage.DataTextField = "Name";
    //        ddlMetricWeightage.DataValueField = "Id";
    //        ddlMetricWeightage.DataBind();
    //        //TabContainer1.ActiveTabIndex = 3;

    //    }
    //}
    protected void ddlMetricAccre_SelectedIndexChanged(object sender, EventArgs e)
    {
        tblAccreditation.Visible = true;
        btnSaveAccre.Visible = true;
        //lstAccreditationMain.ClearSelection();
        lstAccreditationMain.Items.Clear();
        lstAccreditationSubPoints.Items.Clear();
        lstAccreditationSubPoints1.Items.Clear();
        lstAccreditationMain.Visible = false;
        lstAccreditationSubPoints.Visible = false;
        lstAccreditationSubPoints1.Visible = false;
        lstAccreditation.ClearSelection();
    }
    protected void ddlKiAccre_SelectedIndexChanged(object sender, EventArgs e)
    {
        if (ddlKiAccre.SelectedValue != "Select")
        {
            DataSet DsStageMetric = new DataSet();

            SqlParameter[] param = new SqlParameter[2];
            param[0] = new SqlParameter("@type", "GetMetric");
            param[1] = new SqlParameter("@KiId", ddlKiAccre.SelectedValue);
            DsStageMetric = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pGetKeyIndicatorMaster", param);
            ddlMetricAccre.DataSource = DsStageMetric;
            ddlMetricAccre.DataTextField = "Name";
            ddlMetricAccre.DataValueField = "Id";
            ddlMetricAccre.DataBind();
            TabContainer1.ActiveTabIndex = 4;


        }
    }
    //protected void ddlMetricWeightage_SelectedIndexChanged(object sender, EventArgs e)
    //{
    //    //trWeightage.Visible = true;
    //    btnSaveWeightage.Visible = true;
    //    txtMetricWeightage1.Text = "";
    //}
    protected void btnStagesUpload_Click(object sender, EventArgs e)
    {
        TabContainer1.ActiveTabIndex = 3;
        ArrayList errorList;
        errorList = new ArrayList();
        DataTable dt; dt = new DataTable();
        bool isError;
        isError = false;

        if (fuStagesUpload.HasFile)
        {
            var regex = @"^[^<>%$#%&()@|]*$";

            Match match = Regex.Match(fuStagesUpload.FileName, regex, RegexOptions.IgnoreCase);
            if (!match.Success)
            {
                DisplayAJAXMessage(this, "File name contains special characters,so file cannot be uploaded.");
                return;
            }


            if (System.IO.Path.GetExtension(fuStagesUpload.FileName) == ".xls")
            {
                string FileName = Guid.NewGuid().ToString() + Path.GetFileName(fuStagesUpload.PostedFile.FileName);

                string Extension = Path.GetExtension(fuStagesUpload.PostedFile.FileName);
                string FolderPath = ConfigurationManager.AppSettings["FolderPath"];
                strPath = Server.MapPath(FolderPath + "/" + FileName);

                fuStagesUpload.SaveAs(strPath);
                dt = ExcelLibrary.DataSetHelper.CreateDataTable(strPath, "Sheet1");

                if (rblStagesOrCheckList.SelectedValue == "SA")
                {
                    for (int i = 0; i < dt.Rows.Count; i++)
                    {
                        if (dt.Rows[i]["ApplicableTo"].ToString().ToUpper() != "D" && dt.Rows[i]["ApplicableTo"].ToString().ToUpper() != "S" && dt.Rows[i]["ApplicableTo"].ToString().ToUpper() != "B" && dt.Rows[i]["ApplicableTo"].ToString().ToUpper() != "O")
                        {
                            errorList.Add(" Invalid Value in Row- " + (i + 1) + " Column-ApplicableTo");
                            isError = true;
                        }
                    }
                }
                if (rblStagesOrCheckList.SelectedValue == "DC")
                {
                    for (int i = 0; i < dt.Rows.Count; i++)
                    {
                        if (dt.Rows[i]["DocumentDescription"].ToString() == "")
                        {
                            DisplayAJAXMessage(this, "Value cannot be blank in Row- " + (i + 1) + " Column-DocumentDescription");
                            isError = true;
                        }
                        if (dt.Rows[i]["DocumentDescription"].ToString().Length > 100)
                        {
                            DisplayAJAXMessage(this, "Value cannot be greater than 100 characters in Row- " + (i + 1) + " Column-DocumentDescription");
                            isError = true;
                        }
                        if (dt.Rows[i]["DocumentSource"].ToString() != "S" && dt.Rows[i]["DocumentSource"].ToString() != "E" && dt.Rows[i]["DocumentSource"].ToString() != "B")
                        {
                            DisplayAJAXMessage(this, "Wrong value it can be S,E and B- " + (i + 1) + " Column-DocumentSource");
                            isError = true;
                        }
                        if (dt.Rows[i]["IsRequired"].ToString() != "1" && dt.Rows[i]["IsRequired"].ToString() != "0")
                        {
                            DisplayAJAXMessage(this, "Wrong value it can be 1 and 0 " + (i + 1) + " Column-IsRequired");
                            isError = true;
                        }
                    }
                    if (!isError)
                    {
                        string result;
                        using (StringWriter sw = new StringWriter())
                        {
                            dt.TableName = "MetricDocuments";
                            dt.WriteXml(sw);
                            result = sw.ToString();
                        }
                        try
                        {
                            con = new SqlConnection(constr);
                            con.Open();
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.CommandText = "pInsertOutcomeMetricDocuments";
                            cmd.Connection = con;
                            cmd.Parameters.AddWithValue("@DocumentType", rbtnLstDocumentType.SelectedValue);
                            cmd.Parameters.AddWithValue("@DocumentXML", result);
                            //cmd.Parameters.AddWithValue("@DocumentSource", result);
                            //cmd.Parameters.AddWithValue("@IsRequired", result);
                            cmd.Parameters.AddWithValue("@MetricId", ddlStageMetric.SelectedValue);
                            cmd.Parameters.AddWithValue("@LoginId", Session["LoginName"]);
                            cmd.ExecuteNonQuery();
                            cmd.Dispose();
                            con.Close();
                            cmd.Parameters.Clear();
                            DisplayAJAXMessage(this, "Successfully Submitted");
                            btnResetStages_Click(sender, e);
                            return;
                        }
                        catch (Exception aa)
                        {
                            string Msg = aa.Message.ToString();
                            Msg = Msg.Replace("'", "");
                            Msg = Msg.Replace("\r\n", "");
                            DisplayAJAXMessage(this, Msg.ToString());
                        }
                    }

                }
                if (rblStagesOrCheckList.SelectedValue != "DC")
                {
                    if (isError)
                    {
                        btnSaveStages.Visible = false;
                        grdStagesUpload.DataSource = dt;
                        grdStagesUpload.DataBind();

                        File.Delete(strPath);
                    }
                    else
                    {
                        btnSaveStages.Visible = true;
                        grdStagesUpload.DataSource = dt;
                        grdStagesUpload.DataBind();
                        TRStagesOfflinePnl.Visible = true;
                        rFVfuStagesUpload.Enabled = false;
                        File.Delete(strPath);
                    }
                }
            }
            else
            {
                DisplayAJAXMessage(this, "Please upload only .xls extension file");
                return;
            }
        }
        if (fuPDFDocument.HasFile)
        {
            uploadPdfDocument();
            //btnResetStages_Click(sender, e);
        }
    }
    private string OutcomeFiles()
    {
        String FilePath = UploadLocationFilesNew();
        return FilePath;
    }
    public String UploadLocationFilesNew()
    {
        String xLocation = "";
        string Value = Convert.ToString(SqlHelper.ExecuteScalar(con, CommandType.Text, "SELECT dbo.fGetPropertyPageValue('Metric Documents', 'Document File Path')"));
        xLocation = Value;
        return xLocation;
    }


    public string FileUpload(FileUpload image, string id, string existingFileloc)
    {
        try
        {
            string fileloc = "";
            if (image.PostedFile.ToString() != "")
            {
                strPath1 = OutcomeFiles();
                if (strPath1 != "")
                {
                    FtpService newObj = new FtpService();
                    string filename = image.FileName;
                    byte[] str = null;
                    if (!string.IsNullOrEmpty(filename))
                    {
                        using (BinaryReader binaryReader = new BinaryReader(image.PostedFile.InputStream))
                        {
                            str = binaryReader.ReadBytes(image.PostedFile.ContentLength);
                        }
                    }
                    filename = filename.Replace(" ", "_");
                    filename = Session["LoginName"].ToString() + '_' + id + '_' + filename;

                    string ssss = newObj.UploadFile(strPath1, filename, str, FtpUserPassword.GetUMSFtpCredentials());
                    if (ssss.Trim() == "226 Transfer complete.")
                    {

                        fileloc = "success";

                    }
                    else
                    {
                        if (existingFileloc != "")
                        {
                            //250 DELE command successful.
                            string[] filess = existingFileloc.Split(',');
                            foreach (var fi in filess)
                            {
                                string deletefile = newObj.DeleteFile(strPath1, fi, FtpUserPassword.GetUMSFtpCredentials());
                            }
                        }
                        if (ssss.Trim() == "File Already Exists")
                        {
                            DisplayAJAXMessage(this, "File already exists with the same name.");
                            fileloc = "error";
                            //return "error";
                        }
                        else
                        {
                            DisplayAJAXMessage(this, "Something went wrong while uploading the file.");
                            fileloc = "error";
                            //return "error";
                        }
                        //FileUploaded = false;
                    }

                }

            }
            else
            {
                DisplayAJAXMessage(this, "Something went wrong while uploading the file,Contact Infotech Department.");

                fileloc = "error";

            }
            return fileloc;
        }
        catch (SqlException ex)
        {
            FtpService newObj1 = new FtpService();
            if (existingFileloc != "")
            {
                //250 DELE command successful.
                string[] filess = existingFileloc.Split(',');
                foreach (var fi in filess)
                {
                    string deletefile = newObj1.DeleteFile(strPath1, fi, FtpUserPassword.GetUMSFtpCredentials());
                }
            }
            DisplayAJAXMessage(this, ex.Message);

            return "error";
        }
    }
    public void uploadPdfDocument()
    {
        try
        {
            string contentType = fuPDFDocument.PostedFile.ContentType;
            if (contentType != "application/pdf" && contentType != "application/vnd.ms-excel" && contentType != "application/zip" && contentType != "application/x-zip-compressed")
            {
                DisplayAJAXMessage(this, "Upload the file in pdf format,excel or zip.");
                return;
            }
            else
            {

            }
            if (fuPDFDocument.PostedFile.ToString() != "" && fuPDFDocument.PostedFile.ContentLength > 1048576)
            {
                DisplayAJAXMessage(this, "Upload the file of maximum size 1 MB.");
                return;
            }
            if (fuPDFDocument.FileName.ToString().Length > 100)
            {
                DisplayAJAXMessage(this, "Uploaded File Name is greater than expected.");
                return;
            }

            var regex = @"^[^<>%$#%&@()|]*$";

            Match match = Regex.Match(fuPDFDocument.FileName, regex, RegexOptions.IgnoreCase);
            if (!match.Success)
            {
                DisplayAJAXMessage(this, "File name contains special characters,so file cannot be uploaded.");
                return;
            }
            if (con.State == ConnectionState.Closed)
                con.Open();
            //Check whether file is uploaded earlier
            if (rbtnLstDocumentType.SelectedValue == "F")
            {
                SqlParameter[] paramGet = new SqlParameter[2];

                paramGet[0] = new SqlParameter("@MetricId", ddlStageMetric.SelectedValue);
                paramGet[1] = new SqlParameter("@DocumentType", rbtnLstDocumentType.SelectedValue);

                DataSet dssGet = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pGetMetricDocuments", paramGet);
                DataTable dtGet = dssGet.Tables[0];
                if (dtGet.Rows.Count > 0)
                {
                    if (dtGet.Rows[0][1].ToString() != "")
                    {
                        FtpService Obj = new FtpService();
                        string[] filess = dtGet.Rows[0][1].ToString().Split(',');

                        foreach (var fi in filess)
                        {
                            string deletefile = Obj.DeleteFile(strPath1, fi, FtpUserPassword.GetUMSFtpCredentials());
                        }
                    }
                }
            }

            SqlParameter[] param = new SqlParameter[4];
            param[0] = new SqlParameter("@DocumentType", rbtnLstDocumentType.SelectedValue);
            param[1] = new SqlParameter("@MetricId", ddlStageMetric.SelectedValue);
            param[2] = new SqlParameter("@LoginId", Session["LoginName"]);
            if (rbtnLstDocumentType.SelectedValue == "F")
            {
                param[3] = new SqlParameter("@DocumentDescription", txtTitle.Text.Trim());
            }
            else
            {
                param[3] = new SqlParameter("@DocumentDescription", DBNull.Value);
            }
            DataSet dss = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pInsertOutcomeMetricDocuments", param);
            string filename = "";

            string filelocation = "";
            if (dss.Tables.Count > 0)
            {
                DataTable dt = dss.Tables[0];
                if (fuPDFDocument.HasFile)
                {
                    filename = fuPDFDocument.FileName.Replace(" ", "_");
                    filename = Session["LoginName"].ToString() + '_' + dt.Rows[0]["Id"].ToString() + '_' + filename;


                    string fileloc = FileUpload(fuPDFDocument, dt.Rows[0]["Id"].ToString(), "");
                    if (fileloc != "error")
                    {
                        filelocation = filelocation + filename;
                        hdnDeletefiles.Value = filelocation;
                    }
                    else
                    {
                        DisplayAJAXMessage(this, "Document upload failed, please try again.");
                        return;
                    }
                    SqlParameter[] paramss = new SqlParameter[2];
                    paramss[0] = new SqlParameter("@MetricDocumentFileName", filename);
                    paramss[1] = new SqlParameter("@Id", Convert.ToInt32(dt.Rows[0]["Id"].ToString()));

                    DataSet dsupdate = SqlHelper.ExecuteDataset(con, "pUpdateMetricDocumentFileName", paramss);
                    DisplayAJAXMessage(this, "Submitted Successfully.");

                }
            }
        }
        catch (Exception e)
        {
            string Msg = e.Message.ToString();
            Msg = Msg.Replace("'", "");
            Msg = Msg.Replace("\r\n", "");
            string myScript = String.Format("alert('{0}');", Msg);
            ClientScript.RegisterStartupScript(this.GetType(), "MyKey", myScript, true);

            if (hdnDeletefiles.Value != "")
            {
                FtpService Obj = new FtpService();
                string[] filess = hdnDeletefiles.Value.Split(',');
                foreach (var fi in filess)
                {
                    string deletefile = Obj.DeleteFile(strPath1, fi, FtpUserPassword.GetUMSFtpCredentials());
                }
            }
        }
    }
    protected void btnResetStages_Click(object sender, EventArgs e)
    {
        resetmetricdocument();

        ddlDivisionStages.SelectedIndex = 0;
        ddlCriteriaStages.SelectedIndex = 0;
        ddlKiStages.SelectedIndex = 0;
        ddlStageMetric.SelectedIndex = 0;
        rblStagesOptions.ClearSelection();
        TRRequired.Visible = false;
        txtStages.Text = "";
        lblError2.Text = "";
        rblStagesOrCheckList.ClearSelection();
        DownloadUploadedDocList.Visible = false;
        dluploadedMetricDocList.Visible = false;
        hlinkUploadedMetricDocuments.Visible = false;
        lblDocumentNotAvailable.Visible = false;
        hdnReferenceDocUpdate.Value = "";
    }
    public void resetmetricdocument()
    {
        rbtnLstDocumentType.ClearSelection();
        DocumentsTypeList.Visible = false;
        rblStagesOptions.ClearSelection();
        TRStagesSingle.Visible = false;
        TRStagesSingle1.Visible = false;
        TRStagesSingle3.Visible = false;
        TRRequired.Visible = false;
        TRStagesMultiple.Visible = false;
        lblDocuDescription.Visible = false;
        lblstagDescription.Visible = true;
        txtStages.Visible = true;
        txtDocmentDesc.Visible = false;
    }
    protected void btnSaveStages_Click(object sender, EventArgs e)
    {
        try
        {
            if (grdStagesUpload.Visible == true)
                rFVfuStagesUpload.Enabled = false;
            if (rblStagesOrCheckList.SelectedValue == "SA")
            {
                if (rblStagesOptions.SelectedValue == "S")
                {

                    con = new SqlConnection(constr);
                    con.Open();
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandText = "pUploadOutComePlannerMaster";
                    cmd.Connection = con;
                    cmd.Parameters.AddWithValue("@type", "UploadStages");
                    cmd.Parameters.AddWithValue("@StageDescription", txtStages.Text.Trim());
                    cmd.Parameters.AddWithValue("@MetricId", ddlStageMetric.SelectedValue);
                    cmd.Parameters.AddWithValue("@DisplayOrder", txtDisplayOrder.Text);
                    cmd.Parameters.AddWithValue("@ApplicableTo", rblApplicable.SelectedValue);
                    cmd.Parameters.AddWithValue("@LoginId", Session["LoginName"]);
                    cmd.Parameters.AddWithValue("@Stype", "SA");
                    cmd.Parameters.AddWithValue("@DivisionId", ddlDivisionStages.SelectedValue);
                    cmd.ExecuteNonQuery();
                    cmd.Dispose();
                    con.Close();
                    cmd.Parameters.Clear();
                    txtStages.Text = "";
                    txtDisplayOrder.Text = "";
                    DisplayAJAXMessage(this, "Successfully Submitted");
                    return;
                }
                else
                {
                    for (int i = 0; i < grdStagesUpload.Rows.Count; i++)
                    {
                        con = new SqlConnection(constr);
                        con.Open();
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandText = "pUploadOutComePlannerMaster";
                        cmd.Connection = con;
                        cmd.Parameters.AddWithValue("@type", "UploadStages");
                        cmd.Parameters.AddWithValue("@StageDescription", (grdStagesUpload.Rows[i].FindControl("lblStages") as Label).Text);
                        cmd.Parameters.AddWithValue("@DisplayOrder", (grdStagesUpload.Rows[i].FindControl("lblDisplayOrder") as Label).Text);
                        cmd.Parameters.AddWithValue("@ApplicableTo", (grdStagesUpload.Rows[i].FindControl("lblApplicableTo") as Label).Text);
                        cmd.Parameters.AddWithValue("@MetricId", ddlStageMetric.SelectedValue);
                        cmd.Parameters.AddWithValue("@LoginId", Session["LoginName"]);
                        cmd.Parameters.AddWithValue("@Stype", "SA");
                        cmd.Parameters.AddWithValue("@DivisionId", ddlDivisionStages.SelectedValue);
                        cmd.ExecuteNonQuery();
                        cmd.Dispose();
                        con.Close();
                        cmd.Parameters.Clear();
                    }

                    grdStagesUpload.DataBind();
                    DisplayAJAXMessage(this, "Successfully Submitted");
                    return;
                }
            }
            else if (rblStagesOrCheckList.SelectedValue == "DC")
            {

                if (rblStagesOptions.SelectedValue == "S")
                {
                    try
                    {
                        con = new SqlConnection(constr);
                        con.Open();
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandText = "pInsertOutcomeMetricDocuments";
                        cmd.Connection = con;
                        cmd.Parameters.AddWithValue("@DocumentType", rbtnLstDocumentType.SelectedValue);
                        cmd.Parameters.AddWithValue("@DocumentDescription", txtDocmentDesc.Text.Trim());
                        cmd.Parameters.AddWithValue("@MetricId", ddlStageMetric.SelectedValue);
                        cmd.Parameters.AddWithValue("@LoginId", Session["LoginName"]);
                        cmd.Parameters.AddWithValue("@DocumentSource", rdlSource.SelectedValue);
                        cmd.Parameters.AddWithValue("@IsRequired", rdlIsReq.SelectedValue == "0" ? 0 : 1);
                        cmd.ExecuteNonQuery();
                        cmd.Dispose();
                        con.Close();
                        cmd.Parameters.Clear();
                        DisplayAJAXMessage(this, "Successfully Submitted");
                        //btnResetStages_Click(sender, e); 
                        return;
                    }
                    catch (Exception aa)
                    {
                        string Msg = aa.Message.ToString();
                        Msg = Msg.Replace("'", "");
                        Msg = Msg.Replace("\r\n", "");
                        DisplayAJAXMessage(this, Msg.ToString());
                    }
                }
            }
            else
            {
                if (rblStagesOptions.SelectedValue == "S")
                {
                    con = new SqlConnection(constr);
                    con.Open();
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.CommandText = "pUploadOutComePlannerMaster";
                    cmd.Connection = con;
                    cmd.Parameters.AddWithValue("@type", "UploadStages");
                    cmd.Parameters.AddWithValue("@StageDescription", txtStages.Text.Trim());
                    cmd.Parameters.AddWithValue("@DisplayOrder", txtDisplayOrder.Text);
                    cmd.Parameters.AddWithValue("@IsRequired", ddlRequired.SelectedValue);
                    if (rblStagesOrCheckList.SelectedValue == "MC")
                    {
                        cmd.Parameters.AddWithValue("@SMId", ddlStageMetric.SelectedValue);
                        cmd.Parameters.AddWithValue("@Ctype", "M");
                        cmd.Parameters.AddWithValue("@Stype", "MC");
                    }
                    else if (rblStagesOrCheckList.SelectedValue == "SC")
                    {
                        cmd.Parameters.AddWithValue("@SMId", ddlStageList.SelectedValue);
                        cmd.Parameters.AddWithValue("@Ctype", "S");
                        cmd.Parameters.AddWithValue("@Stype", "SC");
                    }
                    cmd.Parameters.AddWithValue("@LoginId", Session["LoginName"]);
                    cmd.ExecuteNonQuery();
                    cmd.Dispose();
                    con.Close();
                    cmd.Parameters.Clear();
                    txtStages.Text = "";
                    txtDisplayOrder.Text = "";
                    DisplayAJAXMessage(this, "Successfully Submitted");
                    return;
                }
                else
                {
                    for (int i = 0; i < grdStagesUpload.Rows.Count; i++)
                    {
                        con = new SqlConnection(constr);
                        con.Open();
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandText = "pUploadOutComePlannerMaster";
                        cmd.Connection = con;
                        cmd.Parameters.AddWithValue("@type", "UploadStages");
                        cmd.Parameters.AddWithValue("@StageDescription", (grdStagesUpload.Rows[i].FindControl("lblStages") as Label).Text);
                        cmd.Parameters.AddWithValue("@DisplayOrder", (grdStagesUpload.Rows[i].FindControl("lblDisplayOrder") as Label).Text);
                        cmd.Parameters.AddWithValue("@IsRequired", (grdStagesUpload.Rows[i].FindControl("lblApplicableTo") as Label).Text);
                        if (rblStagesOrCheckList.SelectedValue == "MC")
                        {
                            cmd.Parameters.AddWithValue("@SMId", ddlStageMetric.SelectedValue);
                            cmd.Parameters.AddWithValue("@Ctype", "M");
                            cmd.Parameters.AddWithValue("@Stype", "MC");
                        }
                        else if (rblStagesOrCheckList.SelectedValue == "SC")
                        {
                            cmd.Parameters.AddWithValue("@SMId", ddlStageList.SelectedValue);
                            cmd.Parameters.AddWithValue("@Ctype", "S");
                            cmd.Parameters.AddWithValue("@Stype", "SC");
                        }
                        cmd.Parameters.AddWithValue("@LoginId", Session["LoginName"]);
                        cmd.ExecuteNonQuery();
                        cmd.Dispose();
                        con.Close();
                        cmd.Parameters.Clear();
                    }

                    grdStagesUpload.DataBind();
                    DisplayAJAXMessage(this, "Successfully Submitted");
                    return;
                }
            }
        }
        catch (Exception ex)
        {
            lblError2.Text = "Error '" + ex.Message + "' '" + ex.Source + "' ";
        }
    }

    protected void rblStagesOptions_SelectedIndexChanged(object sender, EventArgs e)
    {
        if (rblStagesOptions.SelectedValue == "S")
        {
            if (rblStagesOrCheckList.SelectedValue == "DC")
            {
                TRStagesSingle.Visible = true;
                TRStagesSingle1.Visible = false;
                TRStagesMultiple.Visible = false;
                btnSaveStages.Visible = true;
                TRStagesOfflinePnl.Visible = false;
                lblDocuDescription.Visible = true;
                lblstagDescription.Visible = false;
                txtDocmentDesc.Visible = true;
                txtStages.Visible = false;
            }
            else
            {
                TRStagesSingle.Visible = true;
                TRStagesSingle1.Visible = true;
                TRStagesMultiple.Visible = false;
                btnSaveStages.Visible = true;
                TRStagesOfflinePnl.Visible = false;
                TRRequired.Visible = true;
                lblDocuDescription.Visible = false;
                lblstagDescription.Visible = true;
                txtDocmentDesc.Visible = false;
                txtStages.Visible = true;
            }
            if (rbtnLstDocumentType.SelectedValue == "V" && rblStagesOptions.SelectedValue != "M")
            {
                trDocSource.Visible = true;
                trReq.Visible = true;
            }
            else
            {
                trDocSource.Visible = false;
                trReq.Visible = false;
            }
        }
        else
        {
            if (rblStagesOrCheckList.SelectedValue == "DC")
            {
                TRStagesSingle.Visible = false;
                TRStagesSingle1.Visible = false;
                TRStagesMultiple.Visible = true;
                btnSaveStages.Visible = false;
                TRStagesOfflinePnl.Visible = false;
                hLnkMetricDocumentFormat.Visible = true;
                hLnkMetricStageFormat.Visible = false;
                trDocSource.Visible = false;
                trReq.Visible = false;

            }
            else if (rblStagesOrCheckList.SelectedValue == "SA" || rblStagesOrCheckList.SelectedValue == "MC")
            {
                fuStagesUpload.Visible = true;
                fuPDFDocument.Visible = false;
                rFVfuStagesUpload.Enabled = true;
                rFVfuPDFDocument.Enabled = false;
                TRStagesMultiple.Visible = true;
                TRStagesSingle.Visible = false;
                TRStagesSingle1.Visible = false;
                hLnkMetricDocumentFormat.Visible = false;
                hLnkMetricStageFormat.Visible = true;
            }
            else if (rblStagesOrCheckList.SelectedValue == "DC")
            {
                fuStagesUpload.Visible = false;
                fuPDFDocument.Visible = true;
                rFVfuStagesUpload.Enabled = false;
                rFVfuPDFDocument.Enabled = true;
                TRStagesMultiple.Visible = true;
                TRStagesSingle.Visible = false;
                hLnkMetricDocumentFormat.Visible = true;
                hLnkMetricStageFormat.Visible = false;
                trDocSource.Visible = false;
                trReq.Visible = false;
            }
            else
            {

                TRStagesSingle.Visible = false;
                TRStagesSingle1.Visible = false;
                TRStagesMultiple.Visible = true;
                btnSaveStages.Visible = false;
                TRStagesOfflinePnl.Visible = true;
                TRRequired.Visible = false;
                hLnkMetricDocumentFormat.Visible = false;
            }
        }

        if (rblStagesOrCheckList.SelectedValue == "SA")
        {
            if (rblStagesOptions.SelectedValue == "S")
                TRStagesSingle3.Visible = true;
            else
                TRStagesSingle3.Visible = false;

            TRRequired.Visible = false;
        }
        else if (rblStagesOrCheckList.SelectedValue == "DC")
        {
            TRStagesSingle3.Visible = false;
            TRRequired.Visible = false;

        }
        //else if (rblStagesOrCheckList.SelectedValue == "DC" && rblStagesOptions.SelectedValue != "S")
        //{

        //    trReq.Visible = false;
        //    trDocSource.Visible = false;
        //}
        else
        {
            TRStagesSingle3.Visible = false;
            if (rblStagesOptions.SelectedValue == "S")
                TRRequired.Visible = true;
            else
                TRRequired.Visible = false;

        }

        grdStagesUpload.DataBind();
        TabContainer1.ActiveTabIndex = 3;
    }

    protected void ddlCriteriaDivision_SelectedIndexChanged(object sender, EventArgs e)
    {
        SqlParameter[] param = new SqlParameter[2];
        param[0] = new SqlParameter("@type", "getCriteria");
        param[1] = new SqlParameter("@DivisionId", ddlCriteriaDivision.SelectedValue);
        DsKI = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pCriteriaMappingWithKeyIndicator", param);
        ddlCriteriaList.DataSource = DsKI;
        ddlCriteriaList.DataTextField = "Name";
        ddlCriteriaList.DataValueField = "Id";
        ddlCriteriaList.DataBind();

    }

    protected void lnkExportCriteria_Click(object sender, EventArgs e)
    {
        SqlParameter[] param = new SqlParameter[3];
        param[0] = new SqlParameter("@type", "viewCriteria");
        if (ddlCriteriaDivision.SelectedValue == "Select")
            param[1] = new SqlParameter("@DivisionId", DBNull.Value);
        else
            param[1] = new SqlParameter("@DivisionId", ddlCriteriaDivision.SelectedValue);

        param[2] = new SqlParameter("@LoginId", Session["LoginName"]);
        DsCriteriaList = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pSaveCriteria", param);


        GridView datagrid = new GridView();

        datagrid.DataSource = DsCriteriaList.Tables[0];
        datagrid.DataBind();

        datagrid.GridLines = GridLines.Both;
        datagrid.HeaderStyle.Font.Bold = true;
        datagrid.HeaderStyle.BackColor = System.Drawing.Color.LightPink;
        GridViewExportUtil.Export("Report.xls", datagrid, "application/ms-excel");
    }

    protected void rblCriteriaOption_SelectedIndexChanged(object sender, EventArgs e)
    {
        if (rblCriteriaOption.SelectedValue == "S")
        {
            TRCriteriaSingle.Visible = true;
            //TRCriteriaSingle1.Visible = true;
            TRCriteriaMultiple.Visible = false;
            TRCriteriaOfflinePnl.Visible = false;
            btnSaveCriteria.Visible = true;
        }
        else
        {
            TRCriteriaSingle.Visible = false;
            // TRCriteriaSingle1.Visible = false;
            TRCriteriaMultiple.Visible = true;
            TRCriteriaOfflinePnl.Visible = true;
            btnSaveCriteria.Visible = false;
            fuStagesUpload.Visible = true;
            rFVfuStagesUpload.Visible = true;
            fuPDFDocument.Visible = false;
            rFVfuPDFDocument.Visible = false;
        }
        grdCriteria.DataBind();
        TabContainer1.ActiveTabIndex = 0;
    }

    protected void lnkExportKi_Click(object sender, EventArgs e)
    {
        DataSet dsKi = new DataSet();
        SqlParameter[] param = new SqlParameter[3];
        param[0] = new SqlParameter("@type", "getKIReport");
        if (ddlDivisionList.SelectedValue == "Select")
            param[1] = new SqlParameter("@DivisionId", DBNull.Value);
        else
            param[1] = new SqlParameter("@DivisionId", ddlDivisionList.SelectedValue);
        param[3] = new SqlParameter("@LoginId", Session["LoginName"]);
        dsKi = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pGetKeyIndicatorMaster", param);


        GridView datagrid = new GridView();

        datagrid.DataSource = dsKi.Tables[0];
        datagrid.DataBind();

        datagrid.GridLines = GridLines.Both;
        datagrid.HeaderStyle.Font.Bold = true;
        datagrid.HeaderStyle.BackColor = System.Drawing.Color.LightPink;
        GridViewExportUtil.Export("Report.xls", datagrid, "application/ms-excel");
    }

    protected void lnkExportMetricDyn_Click(object sender, EventArgs e)        //13_08_2024  New Click Added
    {

        DataSet dsMetricMaster = new DataSet();
        SqlParameter[] param = new SqlParameter[1];
        param[0] = new SqlParameter("@Type", "MM");
        dsMetricMaster = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pGetOBPMetricExcelData", param);

        GridView datagridMM = new GridView();
        datagridMM.DataSource = dsMetricMaster.Tables[0];
        datagridMM.DataBind();

        XLWorkbook workbook = new XLWorkbook();
        // Add worksheet with data
        var worksheet = workbook.Worksheets.Add(dsMetricMaster.Tables[0], "Sheet1");

        // Formattings Sheet
        worksheet.Table(0).Theme = XLTableTheme.TableStyleLight20;
        worksheet.Row(1).Style.Font.Bold = true;
        worksheet.SheetView.FreezeRows(1);
        worksheet.Columns().AdjustToContents(10.0, 50.0);

        // Convert workbook into stream to download
        var stream = new MemoryStream();
        workbook.SaveAs(stream);

        // Download ExcelFile from Bynary Data
        HttpContext.Current.Response.Clear();
        HttpContext.Current.Response.ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        HttpContext.Current.Response.AddHeader("content-disposition", "attachment; filename=MatricMasterSample.xlsx");
        HttpContext.Current.Response.BinaryWrite(stream.ToArray());

        HttpContext.Current.Response.Flush();
        HttpContext.Current.Response.SuppressContent = true;
        HttpContext.Current.ApplicationInstance.CompleteRequest();


    }
    protected void lnkExportMetric_Click(object sender, EventArgs e)
    {
        DataSet dsMetric = new DataSet();
        SqlParameter[] param = new SqlParameter[3];
        param[0] = new SqlParameter("@type", "getMetricReport");
        if (ddlDivisionMetric.SelectedValue == "Select")
            param[1] = new SqlParameter("@DivisionId", DBNull.Value);
        else
            param[1] = new SqlParameter("@DivisionId", ddlDivisionMetric.SelectedValue);
        param[2] = new SqlParameter("@LoginId", Session["LoginName"]);

        dsMetric = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pGetKeyIndicatorMaster", param);


        GridView datagrid = new GridView();

        datagrid.DataSource = dsMetric.Tables[0];
        datagrid.DataBind();

        datagrid.GridLines = GridLines.Both;
        datagrid.HeaderStyle.Font.Bold = true;
        datagrid.HeaderStyle.BackColor = System.Drawing.Color.LightPink;
        GridViewExportUtil.Export("Report.xls", datagrid, "application/ms-excel");
    }

    protected void lnkExportStages_Click(object sender, EventArgs e)
    {
        DataSet dsStages = new DataSet();
        SqlParameter[] param = new SqlParameter[3];
        param[0] = new SqlParameter("@type", "getStagesReport");
        if (ddlDivisionStages.SelectedValue == "Select")
            param[1] = new SqlParameter("@DivisionId", DBNull.Value);
        else
            param[1] = new SqlParameter("@DivisionId", ddlDivisionStages.SelectedValue);

        param[2] = new SqlParameter("@LoginId", Session["LoginName"]);
        dsStages = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pGetKeyIndicatorMaster", param);


        GridView datagrid = new GridView();

        datagrid.DataSource = dsStages.Tables[0];
        datagrid.DataBind();

        datagrid.GridLines = GridLines.Both;
        datagrid.HeaderStyle.Font.Bold = true;
        datagrid.HeaderStyle.BackColor = System.Drawing.Color.LightPink;
        GridViewExportUtil.Export("Report.xls", datagrid, "application/ms-excel");
    }

    protected void ddlCriteriaSession_DataBound(object sender, EventArgs e)
    {

    }

    protected void ddlCriteriaDivision_DataBound(object sender, EventArgs e)
    {
        ddlCriteriaDivision.Items.Insert(0, "Select");
    }

    protected void ddlSession_DataBound(object sender, EventArgs e)
    {

    }

    protected void ddlDivisionList_DataBound(object sender, EventArgs e)
    {
        ddlDivisionList.Items.Insert(0, "Select");
    }

    protected void ddlCriteriaList_DataBound(object sender, EventArgs e)
    {
        ddlCriteriaList.Items.Insert(0, "Select");
    }
    protected void ddlDivisionMetric_DataBound(object sender, EventArgs e)
    {
        ddlDivisionMetric.Items.Insert(0, "Select");
    }

    protected void ddlCriteriaMetric_DataBound(object sender, EventArgs e)
    {
        ddlCriteriaMetric.Items.Insert(0, "Select");
    }

    protected void ddlKiMetric_DataBound(object sender, EventArgs e)
    {
        ddlKiMetric.Items.Insert(0, "Select");
    }

    protected void ddlDivisionStages_DataBound(object sender, EventArgs e)
    {
        ddlDivisionStages.Items.Insert(0, "Select");
    }
    protected void ddlDivisionAccrre_DataBound(object sender, EventArgs e)
    {
        ddlDivisionAccrre.Items.Insert(0, "Select");
    }
    protected void ddlDivWeightage_DataBound(object sender, EventArgs e)
    {
        ddlDivWeightage.Items.Insert(0, "Select");
    }
    protected void ddlDivKeyWeightage_DataBound(object sender, EventArgs e)
    {
        ddlDivKeyWeightage.Items.Insert(0, "Select");
    }
    protected void ddlDivCriteriaWeightage_DataBound(object sender, EventArgs e)
    {
        ddlDivCriteriaWeightage.Items.Insert(0, "Select");
    }

    protected void ddlCriteriaStages_DataBound(object sender, EventArgs e)
    {
        ddlCriteriaStages.Items.Insert(0, "Select");
    }
    protected void ddlCriteriaAccrre_DataBound(object sender, EventArgs e)
    {
        ddlCriteriaAccrre.Items.Insert(0, "Select");
    }
    protected void ddlWeghtageCriteria_DataBound(object sender, EventArgs e)
    {
        ddlWeghtageCriteria.Items.Insert(0, "Select");
    }
    protected void ddlKeyWeghtageCriteria_DataBound(object sender, EventArgs e)
    {
        ddlKeyWeghtageCriteria.Items.Insert(0, "Select");
    }

    protected void ddlKiStages_DataBound(object sender, EventArgs e)
    {
        ddlKiStages.Items.Insert(0, "Select");
    }
    protected void ddlKiAccre_DataBound(object sender, EventArgs e)
    {
        ddlKiAccre.Items.Insert(0, "Select");
    }
    protected void ddlKeyWeightage_DataBound(object sender, EventArgs e)
    {
        ddlKeyWeightage.Items.Insert(0, "Select");
    }

    protected void ddlMetricAccre_DataBound(object sender, EventArgs e)
    {
        ddlMetricAccre.Items.Insert(0, "Select");
    }
    //protected void ddlMetricWeightage_DataBound(object sender, EventArgs e)
    //{
    //    ddlMetricWeightage.Items.Insert(0, "Select");
    //}
    public void bindWeightageSession()
    {
        SqlParameter[] param = new SqlParameter[1];
        param[0] = new SqlParameter("@type", "X");
        DsSession = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pGetActionSessionForPlanner", param);
        ddlSessionWeightage.DataSource = DsSession;
        ddlSessionWeightage.DataTextField = "Session";
        ddlSessionWeightage.DataValueField = "Id";
        ddlSessionWeightage.DataBind();
        ddlSessionKeyWeightage.DataSource = DsSession;
        ddlSessionKeyWeightage.DataTextField = "Session";
        ddlSessionKeyWeightage.DataValueField = "Id";
        ddlSessionKeyWeightage.DataBind();
        ddlSessionCriteriaWeightage.DataSource = DsSession;
        ddlSessionCriteriaWeightage.DataTextField = "Session";
        ddlSessionCriteriaWeightage.DataValueField = "Id";
        ddlSessionCriteriaWeightage.DataBind();
    }
    protected void ddlStageMetric_DataBound(object sender, EventArgs e)
    {
        ddlStageMetric.Items.Insert(0, "Select");
    }
    //protected void ddlMetricAccre_DataBound(object sender, EventArgs e)
    //{
    //    ddlMetricAccre.Items.Insert(0, "Select");
    //}

    protected void grdCriteria_SelectedIndexChanged(object sender, EventArgs e)
    {

    }

    protected void rblStagesOrCheckList_SelectedIndexChanged(object sender, EventArgs e)
    {
        resetsinglemultiple();
        singlemultiple.Visible = true;
        if (rblStagesOrCheckList.SelectedValue == "SA")
        {
            DocumentsTypeList.Visible = false;
            rFVfuStagesUpload.Enabled = false;
            TR1.Visible = false;
            trReq.Visible = false;
            trDocSource.Visible = false;
        }
        else if (rblStagesOrCheckList.SelectedValue == "MC")
        {
            DocumentsTypeList.Visible = false;
            rFVfuStagesUpload.Enabled = false;
            TR1.Visible = false;
            trReq.Visible = false;
            trDocSource.Visible = false;
        }
        else if (rblStagesOrCheckList.SelectedValue == "SC")
        {
            TRStagesList.Visible = true;
            DocumentsTypeList.Visible = false;
            rFVfuStagesUpload.Enabled = false;
            TR1.Visible = false;
            trReq.Visible = false;
            trDocSource.Visible = false;
        }
        else if (rblStagesOrCheckList.SelectedValue == "DC")
        {
            DocumentsTypeList.Visible = true;
            rFVfuStagesUpload.Enabled = true;
            if (rblStagesOptions.SelectedValue == "S")
            {
                trReq.Visible = true;
                trDocSource.Visible = true;
            }
            else
            {
                trReq.Visible = false;
                trDocSource.Visible = false;
            }

        }
        rblStagesOptions.ClearSelection();
    }
    public void resetsinglemultiple()
    {
        rFVfuStagesUpload.Enabled = false;
        TRStagesList.Visible = false;
        TRStagesSingle.Visible = false;
        TRStagesSingle1.Visible = false;
        TRStagesSingle3.Visible = false;
        TRStagesMultiple.Visible = false;
        TRRequired.Visible = false;
        DownloadUploadedDocList.Visible = false;
        rbtnLstDocumentType.ClearSelection();
    }
    //protected void ddlStageMetric_SelectedIndexChanged(object sender, EventArgs e)
    //{
    //    DataSet DsStageList = new DataSet();
    //    if (ddlStageMetric.SelectedValue != "Select")
    //    {
    //        SqlParameter[] param = new SqlParameter[2];
    //        param[0] = new SqlParameter("@type", "GetStagesList");
    //        param[1] = new SqlParameter("@MetricId", ddlStageMetric.SelectedValue);
    //        DsStageList = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pGetKeyIndicatorMaster", param);
    //        ddlStageList.DataSource = DsStageList;
    //        ddlStageList.DataTextField = "Name";
    //        ddlStageList.DataValueField = "Id";
    //        ddlStageList.DataBind();
    //        TabContainer1.ActiveTabIndex = 3;
    //    }
    //    resetsinglemultiple();

    //}

    protected void ddlStageList_DataBound(object sender, EventArgs e)
    {
        ddlStageList.Items.Insert(0, "Select");
    }
    protected void ddlSessionMaster_SelectedIndexChanged(object sender, EventArgs e)
    {
        bindDsDivision();

        bindMasterDiv();

    }
    public void bindMasterDiv()
    {
        SqlParameter[] param = new SqlParameter[2];
        param[0] = new SqlParameter("@type", "getDivision");
        param[1] = new SqlParameter("@LoginId", Session["LoginName"]);
        DsDivision = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pSaveCriteria", param);
        ddlDivisionMaster.DataSource = DsDivision;
        ddlDivisionMaster.DataTextField = "Name";
        ddlDivisionMaster.DataValueField = "Id";
        ddlDivisionMaster.DataBind();
        ddlFinal.DataSource = DsDivision;
        ddlFinal.DataTextField = "Name";
        ddlFinal.DataValueField = "Id";
        ddlFinal.DataBind();
        ddlFinal.Items.Insert(0, "Select");
        ddlEditFinal.DataSource = DsDivision;
        ddlEditFinal.DataTextField = "Name";
        ddlEditFinal.DataValueField = "Id";
        ddlEditFinal.DataBind();
        ddlEditFinal.Items.Insert(0, "Select");
    }
    public void bindMetricLevel()
    {
        SqlParameter[] param = new SqlParameter[1];
        param[0] = new SqlParameter("@type", "D");
        DataSet SourceLevel = new DataSet();
        SourceLevel = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pGetMetricAllocationLevel", param);
        ddlSourceDivLevel.DataSource = SourceLevel;
        ddlSourceDivLevel.DataTextField = "LevelDesc";
        ddlSourceDivLevel.DataValueField = "Id";
        ddlSourceDivLevel.DataBind();
        ddlSourceDivLevel1.DataSource = SourceLevel;
        ddlSourceDivLevel1.DataTextField = "LevelDesc";
        ddlSourceDivLevel1.DataValueField = "Id";
        ddlSourceDivLevel1.DataBind();
        SqlParameter[] param1 = new SqlParameter[1];
        param[0] = new SqlParameter("@type", "S");
        DataSet SchoolLevel = new DataSet();
        SchoolLevel = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pGetMetricAllocationLevel", param);
        ddlSchoolLevel.DataSource = SchoolLevel;
        ddlSchoolLevel.DataTextField = "LevelDesc";
        ddlSchoolLevel.DataValueField = "Id";
        ddlSchoolLevel.DataBind();
        ddlSchoolLevel1.DataSource = SchoolLevel;
        ddlSchoolLevel1.DataTextField = "LevelDesc";
        ddlSchoolLevel1.DataValueField = "Id";
        ddlSchoolLevel1.DataBind();
        SqlParameter[] param2 = new SqlParameter[1];
        param[0] = new SqlParameter("@type", "O");
        DataSet DivsionLevel = new DataSet();
        DivsionLevel = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pGetMetricAllocationLevel", param);
        ddlDivisionLevel.DataSource = DivsionLevel;
        ddlDivisionLevel.DataTextField = "LevelDesc";
        ddlDivisionLevel.DataValueField = "Id";
        ddlDivisionLevel.DataBind();
        ddlDivisionLevel1.DataSource = DivsionLevel;
        ddlDivisionLevel1.DataTextField = "LevelDesc";
        ddlDivisionLevel1.DataValueField = "Id";
        ddlDivisionLevel1.DataBind();
        ddlDivisionLevel.Items.Insert(0, "Select");
        ddlSchoolLevel.Items.Insert(0, "Select");
        ddlSourceDivLevel.Items.Insert(0, "Select");
        ddlDivisionLevel1.Items.Insert(0, "Select");
        ddlSchoolLevel1.Items.Insert(0, "Select");
        ddlSourceDivLevel1.Items.Insert(0, "Select");
    }
    protected void ddlDivisionMaster_SelectedIndexChanged(object sender, EventArgs e)
    {
        try
        {
            ddlCriteriaDivision.SelectedValue = ddlDivisionMaster.SelectedValue;
            ddlDivisionList.SelectedValue = ddlDivisionMaster.SelectedValue;
            ddlDivisionMetric.SelectedValue = ddlDivisionMaster.SelectedValue;
            ddlDivisionStages.SelectedValue = ddlDivisionMaster.SelectedValue;
            //ddlDivisionAccrre.SelectedValue= ddlDivisionMaster.SelectedValue;
            //ddlSessionWeightage.SelectedValue = ddlDivisionMaster.SelectedValue;
            //ddlSessionKeyWeightage.SelectedValue = ddlDivisionMaster.SelectedValue;
            //ddlSessionCriteriaWeightage.SelectedValue = ddlDivisionMaster.SelectedValue;

            bindCirteriaList();
            bindcriteriaM();
            bindcriteriastages();
        }
        catch (Exception ex)
        {
            lblerror0.Text = "Error '" + ex.Message + "' '" + ex.Source + "' ";
            ddlDivisionList.SelectedIndex = 0;
            ddlDivisionMetric.SelectedIndex = 0;
            ddlDivisionStages.SelectedIndex = 0;
        }
    }

    protected void ddlDivisionMaster_DataBound(object sender, EventArgs e)
    {
        ddlDivisionMaster.Items.Insert(0, "Select");
    }
    public void getdocumentmetricList()
    {
        try
        {
            if (ddlStageMetric.SelectedValue == "" || ddlStageMetric.SelectedValue == "Select")
            {
                DisplayAJAXMessage(this, "Kindly select the Metric to proceed.");
            }
            else
            {
                DataSet DsdocumentList = new DataSet();
                SqlParameter[] param = new SqlParameter[2];
                param[0] = new SqlParameter("@MetricId", ddlStageMetric.SelectedValue);
                param[1] = new SqlParameter("@DocumentType", rbtnLstDocumentType.SelectedValue);
                DsdocumentList = SqlHelper.ExecuteDataset(con, CommandType.StoredProcedure, "pGetOutcomeMetricDocumentList", param);

                if (DsdocumentList.Tables.Count > 0)
                {
                    if (DsdocumentList.Tables[0].Rows.Count > 0)
                    {
                        if (DsdocumentList.Tables[0].Rows[0]["FilePath"].ToString() != "")
                        {
                            hlinkUploadedMetricDocuments.Visible = true;
                            dluploadedMetricDocList.Visible = false;
                            hdnReferenceDocUpdate.Value = DsdocumentList.Tables[0].Rows[0]["FilePath"].ToString();
                            txtTitle.Text = DsdocumentList.Tables[0].Rows[0][0].ToString();
                        }
                        else
                        {
                            dluploadedMetricDocList.Visible = true;
                            hlinkUploadedMetricDocuments.Visible = false;
                            dluploadedMetricDocList.DataSource = DsdocumentList;
                            dluploadedMetricDocList.DataTextField = "DocumentDescription";
                            dluploadedMetricDocList.DataValueField = "DocumentDescription";
                            dluploadedMetricDocList.DataBind();
                        }
                        lblDocumentNotAvailable.Visible = false;
                    }
                    else
                    {
                        dluploadedMetricDocList.Visible = false;
                        hlinkUploadedMetricDocuments.Visible = false;
                        lblDocumentNotAvailable.Visible = true;
                    }
                }
                else
                {
                    dluploadedMetricDocList.Visible = false;
                    hlinkUploadedMetricDocuments.Visible = false;
                    lblDocumentNotAvailable.Visible = true;
                }
            }
            foreach (ListItem item in dluploadedMetricDocList.Items)
            {
                item.Selected = true;
            }
        }
        catch (Exception aa)
        {
            string Msg = aa.Message.ToString();
            Msg = Msg.Replace("'", "");
            Msg = Msg.Replace("\r\n", "");
            DisplayAJAXMessage(this, Msg.ToString());
        }
    }
    protected void rbtnLstDocumentType_SelectedIndexChanged(object sender, EventArgs e)
    {
        rblStagesOptions.ClearSelection();
        getdocumentmetricList();
        DownloadUploadedDocList.Visible = true;

        if (rbtnLstDocumentType.SelectedValue == "V" || rbtnLstDocumentType.SelectedValue == "N")
        {
            singlemultiple.Visible = true;
            fuStagesUpload.Visible = true;
            rFVfuStagesUpload.Visible = true;
            fuPDFDocument.Visible = false;
            rFVfuPDFDocument.Visible = false;
            TRStagesMultiple.Visible = false;
            TR1.Visible = false;

            hLnkMetricDocumentFormat.Visible = true;


        }
        else if (rbtnLstDocumentType.SelectedValue == "F")
        {
            rFVTitleDocumentFormat.Enabled = true;
            TR1.Visible = true;
            singlemultiple.Visible = false;
            TRStagesMultiple.Visible = true;
            hLnkMetricDocumentFormat.Visible = false;
            fuStagesUpload.Visible = false;
            fuPDFDocument.Visible = true;
        }
        else
        {
            singlemultiple.Visible = false;
            TRStagesMultiple.Visible = false;
            TR1.Visible = false;
            TRStagesSingle.Visible = false;
            fuStagesUpload.Visible = false;
            rFVfuStagesUpload.Visible = false;
            fuPDFDocument.Visible = true;
            rFVfuPDFDocument.Visible = true;
            TRStagesMultiple.Visible = true;
            lblnote.Visible = true;
            // TR1.Visible = true;
            hLnkMetricDocumentFormat.Visible = false;
            rFVTitleDocumentFormat.Enabled = false;
            trDocSource.Visible = false;
            trReq.Visible = false;
            // TR1.Visible = false;
        }
    }
    public class MetricSearch
    {
        public int Id { get; set; }
        public string MetricDescription { get; set; }
    }
    /*****Region for Deactive and update metric *****/
    public class Metric
    {
        public int Id { get; set; }
        public string MetricDesc { get; set; }
        public string Category { get; set; }
        public int MetricFinal { get; set; }
        public int MetricWeightage { get; set; }
        public Boolean IsActive { get; set; }
        public int SourceDivLevel { get; set; }
        public int SchoolLevel { get; set; }
        public int OtherDivLevel { get; set; }
        public int AllocationId { get; set; }
        public string MetricFormula { get; set; }
        public char MetricPriority { get; set; }
        public bool MeetingQuarter1 { get; set; }
        public bool MeetingQuarter2 { get; set; }
        public bool MeetingQuarter3 { get; set; }
        public bool MeetingQuarter4 { get; set; }
        public bool IsExclusive { get; set; }
        public bool? IsMandatory { get; set; }
        public string UMSPath { get; set; }

    }
    public class Metricweighatge
    {
        public int SNo { get; set; }
        public int Id { get; set; }
        public int MetricId { get; set; }
        public string Session { get; set; }
        public string Metric { get; set; }
        public string Weightage { get; set; }
        public string Totalweightage { get; set; }
    }



    [WebMethod]
    public static List<MetricSearch> SearchMetrics(string MetricName)
    {
        List<MetricSearch> lstMetric = new List<MetricSearch>();
        try
        {
            SqlCommand sqlcmd = new SqlCommand();
            sqlcmd.Connection = con;
            sqlcmd.CommandType = CommandType.StoredProcedure;
            sqlcmd.CommandText = "pSearchMetricDescription";
            sqlcmd.Parameters.AddWithValue("@MetricName", MetricName);
            if (con.State == ConnectionState.Closed)
                con.Open();
            using (SqlDataReader sdr = sqlcmd.ExecuteReader())
            {
                int Sn = 1;
                while (sdr.Read())
                {
                    lstMetric.Add(new MetricSearch
                    {
                        Id = Convert.ToInt32(sdr["MetricId"]),
                        MetricDescription = sdr["MetricDescription"].ToString()
                    });
                    Sn++;
                }
            }
        }
        catch (Exception ex)
        {

        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        return lstMetric;
    }
    [WebMethod]
    public static List<Metric> GetMetrics(int IndicatorId)
    {
        List<Metric> lstMetric = new List<Metric>();
        try
        {
            SqlCommand sqlcmd = new SqlCommand();
            sqlcmd.Connection = con;
            sqlcmd.CommandType = CommandType.StoredProcedure;
            sqlcmd.CommandText = "pGetOutComeBasedMasters";
            sqlcmd.Parameters.AddWithValue("@type", "GetMetric");
            sqlcmd.Parameters.AddWithValue("@KiId", IndicatorId);
            if (con.State == ConnectionState.Closed)
                con.Open();
            using (SqlDataReader sdr = sqlcmd.ExecuteReader())
            {
                int Sn = 1;
                while (sdr.Read())
                {
                    lstMetric.Add(new Metric
                    {

                        Id = Convert.ToInt32(sdr["Id"]),
                        MetricDesc = sdr["Name"].ToString(),
                        Category = sdr["Category"].ToString(),
                        MetricFinal = Convert.ToInt32(sdr["FinalVerificationDivisionId"]),
                        // MetricWeightage = sdr["MetricWeightage"] == DBNull.Value ? 0 : Convert.ToInt32(sdr["MetricWeightage"]),
                        IsActive = Convert.ToBoolean(sdr["IsActive"]),
                        SourceDivLevel = Convert.ToInt32(sdr["SourceDivisionLevelId"]),
                        OtherDivLevel = Convert.ToInt32(sdr["OtherDivisionLevelId"]),
                        SchoolLevel = Convert.ToInt32(sdr["SchoolLevelId"]),
                        AllocationId = Convert.ToInt32(sdr["AllocationId"]),
                        MetricFormula = sdr["MetricFormula"].ToString(),
                        MetricPriority = sdr["MetricPriority"] != DBNull.Value ? Convert.ToChar(sdr["MetricPriority"]) : 'L',
                        MeetingQuarter1 = Convert.ToBoolean(sdr["MeetingQuarter1"]),
                        MeetingQuarter2 = Convert.ToBoolean(sdr["MeetingQuarter2"]),
                        MeetingQuarter3 = Convert.ToBoolean(sdr["MeetingQuarter3"]),
                        MeetingQuarter4 = Convert.ToBoolean(sdr["MeetingQuarter4"]),
                        IsExclusive = Convert.ToBoolean(sdr["IsExclusive"]),
                        IsMandatory = Convert.ToBoolean(sdr["IsMandatory"]),
                        UMSPath = sdr["UMSPath"].ToString()



                    });
                    Sn++;
                }
            }
        }
        catch (Exception ex)
        {

        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        return lstMetric;
    }
    [WebMethod]
    public static List<Metricweighatge> GetMetricsWeightage(int IndicatorId, int plannerSessionId)
    {

        List<Metricweighatge> lstMetric = new List<Metricweighatge>();
        try
        {
            SqlCommand sqlcmd = new SqlCommand();
            sqlcmd.Connection = con;
            sqlcmd.CommandType = CommandType.StoredProcedure;
            sqlcmd.CommandText = "pGetMetricWeightageSessionWise";
            sqlcmd.Parameters.AddWithValue("@KeyIndicatorId", IndicatorId);
            sqlcmd.Parameters.AddWithValue("@PlannerSessionId", plannerSessionId);
            if (con.State == ConnectionState.Closed)
                con.Open();
            decimal TotalWeightageMetric = 0;
            int Sn = 1;
            using (SqlDataReader sdr = sqlcmd.ExecuteReader())
            {


                while (sdr.Read())
                {
                    string Metricweightage = "";
                    if (sdr["Weightage"].ToString() != "0.00")
                        Metricweightage = sdr["Weightage"].ToString();
                    lstMetric.Add(new Metricweighatge
                    {
                        SNo = Sn,
                        Id = Convert.ToInt32(sdr["Id"]),
                        Metric = sdr["MetricDescription"].ToString(),
                        Session = sdr["Session"].ToString(),
                        Weightage = Metricweightage,
                        MetricId = Convert.ToInt32(sdr["MetricId"])


                    });
                    TotalWeightageMetric = (TotalWeightageMetric + Convert.ToDecimal(sdr["Weightage"]));
                    Sn++;
                }

            }
            Metricweighatge totalweightage = new Metricweighatge();
            totalweightage.Metric = "Total";
            if (lstMetric != null && lstMetric.Count > 0)
                totalweightage.Session = lstMetric[0].Session;
            else
                totalweightage.Session = "";
            totalweightage.Weightage = TotalWeightageMetric.ToString();
            totalweightage.MetricId = 0;
            totalweightage.SNo = Sn++;
            lstMetric.Add(totalweightage);


        }
        catch (Exception ex)
        {

        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        //var newList = lstMetric.OrderByDescending(x => x.MetricId)

        //          .ToList();
        return lstMetric;
    }
    public class KeyIndicatorWeightage
    {
        public int IndicatorId { get; set; }
        public string Description { get; set; }
        public int SNo { get; set; }
        public string Weightage { get; set; }
        public string Session { get; set; }
    }
    public class CriteriaWeightage
    {
        public int CriteriaId { get; set; }
        public string Description { get; set; }
        public int SNo { get; set; }
        public string Weightage { get; set; }
        public string Session { get; set; }
    }
    [WebMethod]
    public static List<KeyIndicatorWeightage> GetIndicatorWeightage(int CriteriaId, int plannerSessionId)
    {

        List<KeyIndicatorWeightage> lstIndicator = new List<KeyIndicatorWeightage>();
        try
        {
            SqlCommand sqlcmd = new SqlCommand();
            sqlcmd.Connection = con;
            sqlcmd.CommandType = CommandType.StoredProcedure;
            sqlcmd.CommandText = "pGetKeyIndicatorWeightageSessionWise";
            sqlcmd.Parameters.AddWithValue("@CriteriaId", CriteriaId);
            sqlcmd.Parameters.AddWithValue("@PlannerSessionId", plannerSessionId);
            if (con.State == ConnectionState.Closed)
                con.Open();
            decimal TotalWeightageMetric = 0;
            int Sn = 1;
            using (SqlDataReader sdr = sqlcmd.ExecuteReader())
            {


                while (sdr.Read())
                {
                    string Indicatorweightage = "";
                    if (sdr["Weightage"].ToString() != "0.00")
                        Indicatorweightage = sdr["Weightage"].ToString();
                    lstIndicator.Add(new KeyIndicatorWeightage
                    {
                        SNo = Sn,
                        Description = sdr["IndicatorDescription"].ToString(),
                        Session = sdr["Session"].ToString(),
                        Weightage = Indicatorweightage,
                        IndicatorId = Convert.ToInt32(sdr["IndicatorId"])


                    });
                    TotalWeightageMetric = (TotalWeightageMetric + Convert.ToDecimal(sdr["Weightage"]));
                    Sn++;
                }

            }
            KeyIndicatorWeightage totalweightage = new KeyIndicatorWeightage();
            totalweightage.Description = "Total";
            if (lstIndicator != null && lstIndicator.Count > 0)
                totalweightage.Session = lstIndicator[0].Session;
            else
                totalweightage.Session = "";
            totalweightage.Weightage = TotalWeightageMetric.ToString();
            totalweightage.IndicatorId = 0;
            totalweightage.SNo = Sn++;
            lstIndicator.Add(totalweightage);


        }
        catch (Exception ex)
        {

        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        return lstIndicator;
    }

    [WebMethod]
    public static List<CriteriaWeightage> GetCriteriaWeightage(int DivId, int plannerSessionId)
    {

        List<CriteriaWeightage> lstCriteria = new List<CriteriaWeightage>();
        try
        {
            SqlCommand sqlcmd = new SqlCommand();
            sqlcmd.Connection = con;
            sqlcmd.CommandType = CommandType.StoredProcedure;
            sqlcmd.CommandText = "pGetCriteriaWeightageSessionWise";
            sqlcmd.Parameters.AddWithValue("@DivId", DivId);
            sqlcmd.Parameters.AddWithValue("@PlannerSessionId", plannerSessionId);
            if (con.State == ConnectionState.Closed)
                con.Open();
            decimal TotalWeightageMetric = 0;
            int Sn = 1;
            using (SqlDataReader sdr = sqlcmd.ExecuteReader())
            {


                while (sdr.Read())
                {
                    string Criteriaweightage = "";
                    if (sdr["Weightage"].ToString() != "0.00")
                        Criteriaweightage = sdr["Weightage"].ToString();
                    lstCriteria.Add(new CriteriaWeightage
                    {
                        SNo = Sn,
                        Description = sdr["Description"].ToString(),
                        Session = sdr["Session"].ToString(),
                        Weightage = Criteriaweightage,
                        CriteriaId = Convert.ToInt32(sdr["CriteriaId"])


                    });
                    TotalWeightageMetric = (TotalWeightageMetric + Convert.ToDecimal(sdr["Weightage"]));
                    Sn++;
                }

            }
            CriteriaWeightage totalweightage = new CriteriaWeightage();
            totalweightage.Description = "Total";
            if (lstCriteria != null && lstCriteria.Count > 0)
                totalweightage.Session = lstCriteria[0].Session;
            else
                totalweightage.Session = "";
            totalweightage.Weightage = TotalWeightageMetric.ToString();
            totalweightage.CriteriaId = 0;
            totalweightage.SNo = Sn++;
            lstCriteria.Add(totalweightage);


        }
        catch (Exception ex)
        {

        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        return lstCriteria;
    }
    [WebMethod]
    public static string DeleteMetrics(int MetricId, string Reason, int IsActive)
    {
        string msg = "";
        if (IsActive == 0)
            msg = "Deactive successfuly";
        else
            msg = "Active successfuly";
        try
        {
            SqlCommand sqlcmd = new SqlCommand();
            sqlcmd.Connection = con;
            sqlcmd.CommandType = CommandType.StoredProcedure;
            sqlcmd.CommandText = "pDeleteCriteriaKeyIndicatorMetric";
            //sqlcmd.Parameters.AddWithValue("@LoginName", HttpContext.Current.Session["LoginName"].ToString());
            sqlcmd.Parameters.AddWithValue("@MetricId", MetricId);
            sqlcmd.Parameters.AddWithValue("@UpdatedBy", HttpContext.Current.Session["LoginName"].ToString());
            sqlcmd.Parameters.AddWithValue("@Type", "Metric");
            sqlcmd.Parameters.AddWithValue("@Reason", Reason);
            sqlcmd.Parameters.AddWithValue("@IsActive", IsActive);
            if (con.State == ConnectionState.Closed)
                con.Open();
            sqlcmd.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
            msg = "Error in deactive";
        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        return msg;
    }
    [WebMethod]
    public static string RenameMetrics(int MetricId, string Desc, string Category, int FinalSourceDivId,
        int IndicatorId, int SourceDiv, int OtherDiv, int School, string MetricFormula, char MetricPriority,
        bool MeetingQuarter1, bool MeetingQuarter2, bool MeetingQuarter3, bool MeetingQuarter4, bool IsExclusive, string newkeyindicatorId, bool IsMandatory, string UmsPath)
    {
        string msg = "";
        // Normalize and replace non-breaking spaces with regular space
        Desc = Desc.Normalize().Replace('\u00A0', ' ');
        // if (!Regex.IsMatch(Desc, @"^[ A-Za-z0-9\-\[\]&()+:.%/,]*$"))
        //if (System.Text.RegularExpressions.Regex.IsMatch(Desc,"^[ A-Za-z0-9-&()+:.%/,]*$") != true)
            if (System.Text.RegularExpressions.Regex.IsMatch(Desc,@"^[ A-Za-z0-9\-\[\]&()+:.%/,]*$") != true)
            msg = "Special characters are not allowed, except +-()&:.%/,[]";
        //if (System.Text.RegularExpressions.Regex.IsMatch(MetricWeightage,
        //                                   "") != true)
        //    msg = "Special characters are not allowed, except -()&:.%/";

        try
        {
            if (msg == "")
            {
                msg = "Update successfuly";
                SqlCommand sqlcmd = new SqlCommand();
                sqlcmd.Connection = con;
                sqlcmd.CommandType = CommandType.StoredProcedure;
                sqlcmd.CommandText = "pUpdateDescOfCriteriaIndicatorMetric";
                sqlcmd.Parameters.AddWithValue("@MetricId", MetricId);
                sqlcmd.Parameters.AddWithValue("@UpdatedBy", HttpContext.Current.Session["LoginName"].ToString());
                sqlcmd.Parameters.AddWithValue("@IndicatorId", IndicatorId);
                sqlcmd.Parameters.AddWithValue("@Desc", Desc);
                sqlcmd.Parameters.AddWithValue("@Category", Category);
                sqlcmd.Parameters.AddWithValue("@Type", "Metric");
                sqlcmd.Parameters.AddWithValue("@FinalDivId", FinalSourceDivId);
                sqlcmd.Parameters.AddWithValue("@MetricFormula", MetricFormula);
                sqlcmd.Parameters.AddWithValue("@MetricPriority", MetricPriority);
                sqlcmd.Parameters.AddWithValue("@MeetingQuarter1", MeetingQuarter1);
                sqlcmd.Parameters.AddWithValue("@MeetingQuarter2", MeetingQuarter2);
                sqlcmd.Parameters.AddWithValue("@MeetingQuarter3", MeetingQuarter3);
                sqlcmd.Parameters.AddWithValue("@MeetingQuarter4", MeetingQuarter4);
                sqlcmd.Parameters.AddWithValue("@IsExclusive", IsExclusive);
                sqlcmd.Parameters.AddWithValue("@IsMandatory", IsMandatory);
                sqlcmd.Parameters.AddWithValue("@UmsPath", UmsPath);
                sqlcmd.Parameters.AddWithValue("@UpdatedKeyIndicatorId", newkeyindicatorId == "0" ? (object)DBNull.Value : newkeyindicatorId);
                // sqlcmd.Parameters.AddWithValue("@MetricWeightage", MetricWeightage);
                if (SourceDiv != 0)
                    sqlcmd.Parameters.AddWithValue("@SourceDivsionLevel", SourceDiv);
                else
                    sqlcmd.Parameters.AddWithValue("@SourceDivsionLevel", DBNull.Value);
                if (OtherDiv != 0)
                    sqlcmd.Parameters.AddWithValue("@OtherDivisionLevel", OtherDiv);
                else
                    sqlcmd.Parameters.AddWithValue("@OtherDivisionLevel", DBNull.Value);
                if (School != 0)
                    sqlcmd.Parameters.AddWithValue("@SchoolLevel", School);
                else
                    sqlcmd.Parameters.AddWithValue("@SchoolLevel", DBNull.Value);
                if (con.State == ConnectionState.Closed)
                    con.Open();
                sqlcmd.ExecuteNonQuery();
            }
        }
        catch (Exception ex)
        {
            msg = ex.Message.ToString();
            msg = msg.Replace("'", "");
            msg = msg.Replace("\r\n", "");
            Page page = (Page)HttpContext.Current.Handler;
            DisplayAJAXMessage(page, msg.ToString());

        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        return msg;
    }


    /*****Region for Deactive and update KeyIndicator *****/
    public class KeyIndicator
    {
        public int Id { get; set; }
        public string IndicatorDesc { get; set; }
        public bool ISActive { get; set; }
        public int IndicatorWeightage { get; set; }

    }
    [WebMethod]
    public static List<KeyIndicator> GetIndicators(int CriteriaId)
    {
        List<KeyIndicator> lstKeyIndicator = new List<KeyIndicator>();
        try
        {
            SqlCommand sqlcmd = new SqlCommand();
            sqlcmd.Connection = con;
            sqlcmd.CommandType = CommandType.StoredProcedure;
            sqlcmd.CommandText = "pGetOutComeBasedMasters";
            sqlcmd.Parameters.AddWithValue("@type", "GetKI");
            sqlcmd.Parameters.AddWithValue("@CriteriaId", CriteriaId);
            if (con.State == ConnectionState.Closed)
                con.Open();
            using (SqlDataReader sdr = sqlcmd.ExecuteReader())
            {
                int Sn = 1;
                while (sdr.Read())
                {
                    lstKeyIndicator.Add(new KeyIndicator
                    {
                        Id = Convert.ToInt32(sdr["Id"]),
                        IndicatorDesc = sdr["Name"].ToString(),
                        ISActive = Convert.ToBoolean(sdr["IsActive"]),
                        //IndicatorWeightage = Convert.ToInt32(sdr["IndicatorWeightage"])
                    });
                    Sn++;
                }
            }
        }
        catch (Exception ex)
        {

        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        return lstKeyIndicator;
    }
    [WebMethod]
    public static string DeleteKeyIndicator(int IndicatorId, string Reason, int IsActive)
    {
        string msg = "";
        if (IsActive == 0)
            msg = "Deactive successfuly";
        else
            msg = "Active successfuly";
        try
        {
            SqlCommand sqlcmd = new SqlCommand();
            sqlcmd.Connection = con;
            sqlcmd.CommandType = CommandType.StoredProcedure;
            sqlcmd.CommandText = "pDeleteCriteriaKeyIndicatorMetric";
            sqlcmd.Parameters.AddWithValue("@IndicatorId", IndicatorId);
            sqlcmd.Parameters.AddWithValue("@EntryBy", HttpContext.Current.Session["LoginName"].ToString());
            sqlcmd.Parameters.AddWithValue("@Type", "Indicator");
            sqlcmd.Parameters.AddWithValue("@Reason", Reason);
            sqlcmd.Parameters.AddWithValue("@IsActive", IsActive);
            if (con.State == ConnectionState.Closed)
                con.Open();
            sqlcmd.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
            if (IsActive == 0)
                msg = "Error In Deactive";
            else
                msg = "Error in Active";
        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        return msg;
    }
    [WebMethod]
    public static string RenameIndicator(int IndicatorId, string Desc, int IndicatorCriteriaId)
    {
        string msg = "";
        if (System.Text.RegularExpressions.Regex.IsMatch(Desc,
                                           "^[ A-Za-z0-9-&(),]*$") != true)
            msg = "Special characters are not allowed, except -()&,";

        try
        {
            if (msg == "")
            {
                msg = "Rename successfuly";
                SqlCommand sqlcmd = new SqlCommand();
                sqlcmd.Connection = con;
                sqlcmd.CommandType = CommandType.StoredProcedure;
                //sqlcmd.CommandText = "Update KeyIndicatorMaster Set IndicatorDescription=@Desc,EntryBy=@EntryBy,EntryDateTime=@EntryDateTime where IndicatorId=@IndicatorId";
                sqlcmd.CommandText = "pUpdateDescOfCriteriaIndicatorMetric";
                //sqlcmd.Parameters.AddWithValue("@LoginName", HttpContext.Current.Session["LoginName"].ToString());
                sqlcmd.Parameters.AddWithValue("@IndicatorId", IndicatorId);
                sqlcmd.Parameters.AddWithValue("@EntryBy", HttpContext.Current.Session["LoginName"].ToString());
                // sqlcmd.Parameters.AddWithValue("@EntryDateTime", DateTime.Now.Date);
                sqlcmd.Parameters.AddWithValue("@Desc", Desc);
                sqlcmd.Parameters.AddWithValue("@Type", "Indicator");
                //sqlcmd.Parameters.AddWithValue("@IndicatorWeightage", IndicatorWeightage);
                sqlcmd.Parameters.AddWithValue("@IndicatorCriteriaId", IndicatorCriteriaId);

                if (con.State == ConnectionState.Closed)
                    con.Open();
                sqlcmd.ExecuteNonQuery();
            }
        }
        catch (Exception ex)
        {
            msg = ex.Message.ToString();
            msg = msg.Replace("'", "");
            msg = msg.Replace("\r\n", "");
            msg = "Error '" + ex.Message + "' '" + ex.Source + "' ";
            Page page = (Page)HttpContext.Current.Handler;
            DisplayAJAXMessage(page, msg);

        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        return msg;
    }

    /**End Region ****/

    public class Criteria
    {
        public int Id { get; set; }
        public string CriteriaDesc { get; set; }
        public bool ISActive { get; set; }
        public int Weightage { get; set; }

    }

    [WebMethod]
    public static List<Criteria> GetCriterias(int divId)
    {
        List<Criteria> lstCriteria = new List<Criteria>();
        try
        {
            SqlCommand sqlcmd = new SqlCommand();
            sqlcmd.Connection = con;
            sqlcmd.CommandType = CommandType.StoredProcedure;
            sqlcmd.CommandText = "pGetOutComeBasedMasters";
            sqlcmd.Parameters.AddWithValue("@type", "GetCriteria");
            sqlcmd.Parameters.AddWithValue("@DivisionId", divId);
            if (con.State == ConnectionState.Closed)
                con.Open();
            using (SqlDataReader sdr = sqlcmd.ExecuteReader())
            {
                int Sn = 1;
                while (sdr.Read())
                {
                    lstCriteria.Add(new Criteria
                    {
                        Id = Convert.ToInt32(sdr["Id"]),
                        CriteriaDesc = sdr["Name"].ToString(),
                        ISActive = Convert.ToBoolean(sdr["IsActive"]),
                        //Weightage = Convert.ToInt32(sdr["Weightage"])
                    });
                    Sn++;
                }
            }
        }
        catch (Exception ex)
        {

        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        return lstCriteria;
    }
    [WebMethod]
    public static string DeleteCriteria(int CriteriaId, string Reason, int IsActive)
    {
        string msg = "";
        if (IsActive == 0)
            msg = "Deactive successfuly";
        else
            msg = "Active successfuly";
        try
        {
            SqlCommand sqlcmd = new SqlCommand();
            sqlcmd.Connection = con;
            sqlcmd.CommandType = CommandType.StoredProcedure;
            sqlcmd.CommandText = "pDeleteCriteriaKeyIndicatorMetric";
            sqlcmd.Parameters.AddWithValue("@CriteriaId", CriteriaId);
            sqlcmd.Parameters.AddWithValue("@UpdatedBy", HttpContext.Current.Session["LoginName"].ToString());
            sqlcmd.Parameters.AddWithValue("@Type", "Criteria");
            sqlcmd.Parameters.AddWithValue("@Reason", Reason);
            sqlcmd.Parameters.AddWithValue("@IsActive", IsActive);
            if (con.State == ConnectionState.Closed)
                con.Open();
            sqlcmd.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
            msg = "Error in deactive";
        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        return msg;
    }
    [WebMethod]
    public static string RenameCriteria(int CriteriaId, string Desc, int DivId)
    {
        string msg = "";
        if (System.Text.RegularExpressions.Regex.IsMatch(Desc,
                                           "^[ A-Za-z0-9-&(),]*$") != true)
            msg = "Special characters are not allowed, except -()&,";

        try
        {
            if (msg == "")
            {
                msg = "Rename successfuly";
                SqlCommand sqlcmd = new SqlCommand();
                sqlcmd.Connection = con;
                sqlcmd.CommandType = CommandType.StoredProcedure;
                sqlcmd.CommandText = "pUpdateDescOfCriteriaIndicatorMetric";
                sqlcmd.Parameters.AddWithValue("@CriteriaId", CriteriaId);
                sqlcmd.Parameters.AddWithValue("@EntryBy", HttpContext.Current.Session["LoginName"].ToString());
                sqlcmd.Parameters.AddWithValue("@DivId", DivId);
                sqlcmd.Parameters.AddWithValue("@Desc", Desc);
                sqlcmd.Parameters.AddWithValue("@Type", "Criteria");
                // sqlcmd.Parameters.AddWithValue("@CriteriaWeightage", Weightage);
                if (con.State == ConnectionState.Closed)
                    con.Open();
                sqlcmd.ExecuteNonQuery();
            }
        }
        catch (Exception ex)
        {
            msg = ex.Message;
        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        return msg;
    }
    public class Stages
    {
        public int StageId { get; set; }
        public string StageName { get; set; }
        public string Applicable { get; set; }
        public bool IsActive { get; set; }
        public int DisplayOrder { get; set; }
    }
    public class CheckList
    {
        public int ChklstId { get; set; }
        public string ChklstName { get; set; }
        public string Required { get; set; }
        public int Displayorder { get; set; }
        public int IsActive { get; set; }
    }
    [WebMethod]
    public static List<Stages> GetStages(int MetricId)
    {
        List<Stages> lstStage = new List<Stages>();
        try
        {
            SqlCommand sqlcmd = new SqlCommand();
            sqlcmd.Connection = con;
            sqlcmd.CommandType = CommandType.Text;
            sqlcmd.CommandText = "Select StageId,StageDescription,ApplicableTo,IsActive,DisplayOrder from dbo.MetricStageMaster WHERE MetricId=@MetricId";
            sqlcmd.Parameters.AddWithValue("@MetricId", MetricId);
            if (con.State == ConnectionState.Closed)
                con.Open();
            using (SqlDataReader sdr = sqlcmd.ExecuteReader())
            {
                int Sn = 1;
                while (sdr.Read())
                {
                    lstStage.Add(new Stages
                    {

                        StageId = Convert.ToInt32(sdr["StageId"]),
                        StageName = sdr["StageDescription"].ToString(),
                        Applicable = sdr["ApplicableTo"].ToString(),
                        IsActive = Convert.ToBoolean(sdr["IsActive"]),
                        DisplayOrder = Convert.ToInt32(sdr["DisplayOrder"])

                    });
                    Sn++;
                }
            }
        }
        catch (Exception ex)
        {

        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        return lstStage;
    }

    [WebMethod]
    public static List<CheckList> GetCheckList(int MetricId)
    {
        List<CheckList> lstChklst = new List<CheckList>();
        try
        {
            SqlCommand sqlcmd = new SqlCommand();
            sqlcmd.Connection = con;
            sqlcmd.CommandType = CommandType.Text;
            sqlcmd.CommandText = "Select Id,Description,DisplayOrder,IsRequired,IsActive from dbo.PlannerCheckList WHERE StagesId=@MetricId and Type=@Type";
            sqlcmd.Parameters.AddWithValue("@MetricId", MetricId);
            sqlcmd.Parameters.AddWithValue("@Type", "MC");
            if (con.State == ConnectionState.Closed)
                con.Open();
            using (SqlDataReader sdr = sqlcmd.ExecuteReader())
            {
                int Sn = 1;
                while (sdr.Read())
                {
                    string Req = "";
                    if (sdr["IsRequired"] != DBNull.Value)
                    {
                        if (Convert.ToInt32(sdr["IsRequired"]) == 1)
                            Req = "Yes";
                        else
                            Req = "No";


                    }
                    lstChklst.Add(new CheckList
                    {

                        ChklstId = Convert.ToInt32(sdr["Id"]),
                        ChklstName = sdr["Description"].ToString(),
                        Displayorder = Convert.ToInt32(sdr["DisplayOrder"]),
                        Required = Req,
                        IsActive = sdr["IsActive"] != DBNull.Value ? Convert.ToInt32(sdr["IsActive"]) : 1


                    });
                    Sn++;
                }
            }
        }
        catch (Exception ex)
        {

        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        return lstChklst;
    }
    [WebMethod]
    public static string RenameStages(int StageId, string Desc, string Applicable, int DisplayOrder)
    {
        string msg = "";

        try
        {
            if (msg == "")
            {
                msg = "Update successfuly";
                SqlCommand sqlcmd = new SqlCommand();
                sqlcmd.Connection = con;
                sqlcmd.CommandType = CommandType.Text;
                sqlcmd.CommandText = "Update dbo.MetricStageMaster set  StageDescription=@Desc,ApplicableTo=@Applicable,Entryby=@EntryBy,UpdatedOn=@UpdatedOn,DisplayOrder=@DisplayOrder where stageid=@StageId";
                sqlcmd.Parameters.AddWithValue("@StageId", StageId);
                sqlcmd.Parameters.AddWithValue("@EntryBy", HttpContext.Current.Session["LoginName"].ToString());
                sqlcmd.Parameters.AddWithValue("@UpdatedOn", DateTime.Now.Date);
                sqlcmd.Parameters.AddWithValue("@Desc", Desc);
                sqlcmd.Parameters.AddWithValue("@Applicable", Applicable);
                sqlcmd.Parameters.AddWithValue("@DisplayOrder", DisplayOrder);

                if (con.State == ConnectionState.Closed)
                    con.Open();
                sqlcmd.ExecuteNonQuery();
            }
        }
        catch (Exception ex)
        {
            msg = ex.Message.ToString();
            msg = msg.Replace("'", "");
            msg = msg.Replace("\r\n", "");
            Page page = (Page)HttpContext.Current.Handler;
            DisplayAJAXMessage(page, msg.ToString());

        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        return msg;
    }

    [WebMethod]
    public static string RenameCheckList(int CheckListId, string Desc, string Req, string DisplayOrder)
    {
        string msg = "";

        try
        {
            if (msg == "")
            {
                msg = "Rename successfuly";
                SqlCommand sqlcmd = new SqlCommand();
                sqlcmd.Connection = con;
                sqlcmd.CommandType = CommandType.Text;
                sqlcmd.CommandText = "Update dbo.PlannerCheckList set Description=@Desc,IsRequired=@IsRequired,Entryby=@EntryBy,EntryDate=@EntryDate,DisplayOrder=@DisplayOrder where Id=@CheckListId";
                sqlcmd.Parameters.AddWithValue("@CheckListId", CheckListId);
                sqlcmd.Parameters.AddWithValue("@EntryBy", HttpContext.Current.Session["LoginName"].ToString());
                sqlcmd.Parameters.AddWithValue("@EntryDate", DateTime.Now.Date);
                sqlcmd.Parameters.AddWithValue("@Desc", Desc);
                sqlcmd.Parameters.AddWithValue("@IsRequired", Req);
                sqlcmd.Parameters.AddWithValue("@DisplayOrder", DisplayOrder);

                if (con.State == ConnectionState.Closed)
                    con.Open();
                sqlcmd.ExecuteNonQuery();
            }
        }
        catch (Exception ex)
        {
            msg = ex.Message.ToString();
            msg = msg.Replace("'", "");
            msg = msg.Replace("\r\n", "");
            Page page = (Page)HttpContext.Current.Handler;
            DisplayAJAXMessage(page, msg.ToString());

        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        return msg;
    }


    [WebMethod]
    public static string DeleteStage(int StageId, string Reason, int IsActive)
    {
        string msg = "";
        if (IsActive == 0)
            msg = "Deactive successfuly";
        else
            msg = "Active successfuly";
        try
        {
            SqlCommand sqlcmd = new SqlCommand();
            sqlcmd.Connection = con;
            sqlcmd.CommandType = CommandType.Text;
            sqlcmd.CommandText = "Update dbo.MetricStageMaster set isactive=@IsActive,ReasonofDeactivation=@Reason,UpdatedOn=Getdate() where stageId=@StageId";
            sqlcmd.Parameters.AddWithValue("@StageId", StageId);
            sqlcmd.Parameters.AddWithValue("@EntryBy", HttpContext.Current.Session["LoginName"].ToString());

            sqlcmd.Parameters.AddWithValue("@Reason", Reason);
            sqlcmd.Parameters.AddWithValue("@IsActive", IsActive);
            if (con.State == ConnectionState.Closed)
                con.Open();
            sqlcmd.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
            if (IsActive == 0)
                msg = "Error In Deactive";
            else
                msg = "Error in Active";
        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        return msg;
    }
    [WebMethod]
    public static string DeleteCheckList(int CheckListId, int IsActive, string Reason)
    {
        string msg = "";
        if (IsActive == 0)
            msg = "Deactive successfuly";
        else
            msg = "Active successfuly";
        try
        {
            SqlCommand sqlcmd = new SqlCommand();
            sqlcmd.Connection = con;
            sqlcmd.CommandType = CommandType.Text;
            sqlcmd.CommandText = "Update dbo.PlannerCheckList set isactive=@IsActive,ReasonToDeactive=@Reason,UpdatedBy=@EntryBy,UpdatedOn=GetDate() where Id=@CheckListId";
            sqlcmd.Parameters.AddWithValue("@CheckListId", CheckListId);
            sqlcmd.Parameters.AddWithValue("@EntryBy", HttpContext.Current.Session["LoginName"].ToString());
            sqlcmd.Parameters.AddWithValue("@IsActive", IsActive);
            sqlcmd.Parameters.AddWithValue("@Reason", Reason);
            if (con.State == ConnectionState.Closed)
                con.Open();
            sqlcmd.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
            if (IsActive == 0)
                msg = "Error In Deactive";
            else
                msg = "Error in Active";
        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        return msg;
    }
    public void BindAccreditation()

    {
        SqlDataAdapter da = new SqlDataAdapter("pGetAccreditationData", con);
        da.SelectCommand.CommandType = CommandType.StoredProcedure;
        da.SelectCommand.Parameters.AddWithValue("@Type", "1");
        DataSet ds = new DataSet();
        da.Fill(ds);

        lstAccreditation.DataSource = ds;
        lstAccreditation.DataTextField = "Name";
        lstAccreditation.DataValueField = "Id";
        lstAccreditation.DataBind();


    }
    public void BindMainPoint(string AccreditationId, string ParentPointId, bool IsSubPoint, bool IsSubPoint1)
    {
        try
        {
            string type = "";
            if (string.IsNullOrEmpty(ParentPointId))
                type = "2";
            else
                type = "3";
            SqlDataAdapter da = new SqlDataAdapter("pGetAccreditationData", con);
            da.SelectCommand.CommandType = CommandType.StoredProcedure;
            da.SelectCommand.Parameters.AddWithValue("@AccreditationId", AccreditationId);
            da.SelectCommand.Parameters.AddWithValue("@Type", type);
            da.SelectCommand.Parameters.AddWithValue("@ParentpointId", ParentPointId);
            DataSet ds = new DataSet();
            da.Fill(ds);


            if (string.IsNullOrEmpty(ParentPointId))
            {

                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    ListItem li = new ListItem();
                    li.Text = ds.Tables[0].Rows[i]["Name"].ToString();
                    li.Value = ds.Tables[0].Rows[i]["Id"].ToString();
                    lstAccreditationMain.Items.Add(li);
                }
                if (lstAccreditationMain.Items.Count > 0)
                    lstAccreditationMain.Visible = true;
                else
                    lstAccreditationMain.Visible = false;
            }
            else if (IsSubPoint == true)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    ListItem li = new ListItem();
                    li.Text = ds.Tables[0].Rows[i]["Name"].ToString();
                    li.Value = ds.Tables[0].Rows[i]["Id"].ToString();
                    lstAccreditationSubPoints.Items.Add(li);
                }
                if (lstAccreditationSubPoints.Items.Count > 0)
                    lstAccreditationSubPoints.Visible = true;
                else
                    lstAccreditationSubPoints.Visible = false;
            }
            else if (IsSubPoint1 == true)
            {
                if (ds.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        ListItem li = new ListItem();
                        li.Text = ds.Tables[0].Rows[i]["Name"].ToString();
                        li.Value = ds.Tables[0].Rows[i]["Id"].ToString();
                        lstAccreditationSubPoints1.Items.Add(li);
                    }
                }
                else
                {
                    ParentPointIds.Add(ParentPointId);
                }
                if (lstAccreditationSubPoints1.Items.Count > 0)
                    lstAccreditationSubPoints1.Visible = true;
                else
                    lstAccreditationSubPoints1.Visible = false;

            }

        }
        catch (Exception ex)
        {

        }

    }




    protected void lstAccreditation_SelectedIndexChanged(object sender, EventArgs e)
    {

        lstAccreditationMain.Items.Clear();
        lstAccreditationSubPoints.Items.Clear();
        lstAccreditationSubPoints1.Items.Clear();

        foreach (ListItem li in lstAccreditation.Items)
        {
            if (li.Selected)
            {
                BindMainPoint(li.Value, "", false, false);
            }
        }

    }


    protected void lstAccreditationMain_SelectedIndexChanged(object sender, EventArgs e)
    {
        string AccreditationBody = string.Empty, AccreditationMain = string.Empty;
        int[] selectedindex = lstAccreditation.GetSelectedIndices();

        AccreditationBody = lstAccreditation.Items[selectedindex.Length - 1].Value;

        int[] selectedindex1 = lstAccreditationMain.GetSelectedIndices();

        AccreditationMain = lstAccreditationMain.Items[selectedindex1.Length - 1].Value;
        lstAccreditationSubPoints.Items.Clear();
        lstAccreditationSubPoints1.Items.Clear();
        foreach (ListItem li in lstAccreditationMain.Items)
        {
            if (li.Selected == true)
            {
                BindMainPoint(AccreditationBody, li.Value, true, false);
            }
        }

    }


    protected void lstAccreditationSubPoints_SelectedIndexChanged(object sender, EventArgs e)
    {

        string AccreditationBody = string.Empty, AccreditationMain = string.Empty, AccreditationSubPoint = string.Empty;

        int[] selectedindex = lstAccreditation.GetSelectedIndices();

        AccreditationBody = lstAccreditation.Items[selectedindex.Length - 1].Value;

        int[] selectedindex1 = lstAccreditationSubPoints.GetSelectedIndices();

        AccreditationSubPoint = lstAccreditationSubPoints.Items[selectedindex1.Length - 1].Value;

        lstAccreditationSubPoints1.Items.Clear();
        foreach (ListItem li in lstAccreditationSubPoints.Items)
        {
            if (li.Selected == true)
            {
                BindMainPoint(AccreditationBody, li.Value, false, true);
            }
        }


    }

    protected void lstAccreditationSubPoints1_SelectedIndexChanged(object sender, EventArgs e)
    {


    }

    public class UpdateData
    {
        public int MetricId { get; set; }
        public string Weightage { get; set; }
        public string Session { get; set; }
    }
    public class IndicatorUpdateData
    {
        public int IndicatorId { get; set; }
        public string Weightage { get; set; }
        public string Session { get; set; }
    }
    public class CriteriaUpdateData
    {
        public int CriteriaId { get; set; }
        public string Weightage { get; set; }
        public string Session { get; set; }
    }
    [WebMethod]
    public static string SaveWeightage(List<UpdateData> lstUpdateData)
    {
        string ReturnMessage = "Insert/Updated Successfuly";
        int zeroRecord = 0;
        try
        {
            if (lstUpdateData.Count > 0)
            {
                XmlDocument doc = new XmlDocument();
                string CS = ConfigurationManager.ConnectionStrings["NewUMSConnectionString"].ConnectionString;


                XmlDeclaration declaire = doc.CreateXmlDeclaration("1.0", "utf-16", null);
                // -----------------------create root-----------------------------  
                XmlElement rootnode = doc.CreateElement("root");
                doc.InsertBefore(declaire, doc.DocumentElement);
                doc.AppendChild(rootnode);

                foreach (UpdateData metricweightage in lstUpdateData)
                {
                    XmlElement AccreditationData = doc.CreateElement("WeightageData");
                    if (metricweightage != null)
                    {
                        //if (metricweightage.Weightage != "0" && metricweightage.Weightage != "0.00" && metricweightage.Weightage != "")
                        if ( metricweightage.Weightage != "")
                        {
                            XmlElement MetricId = doc.CreateElement("MetricId");
                            MetricId.InnerText = metricweightage.MetricId.ToString();
                            XmlElement Weightage = doc.CreateElement("Weightage");
                            Weightage.InnerText = metricweightage.Weightage.ToString();
                            XmlElement Session = doc.CreateElement("Session");
                            Session.InnerText = metricweightage.Session.ToString();
                            AccreditationData.AppendChild(MetricId);
                            AccreditationData.AppendChild(Weightage);
                            AccreditationData.AppendChild(Session);
                            doc.DocumentElement.AppendChild(AccreditationData);
                        }
                        else
                            zeroRecord++;
                    }

                }
                if (zeroRecord > 0)
                    ReturnMessage = "Weightage with values zero are not saved";
                SqlCommand sqlcmd = new SqlCommand();
                sqlcmd.Connection = con;
                con.Open();
                sqlcmd.CommandType = CommandType.StoredProcedure;
                sqlcmd.CommandText = "pInsertMetricWeightage";
                sqlcmd.Parameters.AddWithValue("@XMLData", doc.InnerXml.ToString());
                sqlcmd.Parameters.AddWithValue("@EntryBy", HttpContext.Current.Session["LoginName"].ToString());
                sqlcmd.ExecuteNonQuery();
                con.Close();
                //    }
                //}
            }
        }
        catch (Exception ex)
        {
            ReturnMessage = "Some Error Ocurred, Please try again ";

        }
        return ReturnMessage;
    }

    [WebMethod]
    public static string SaveIndicatorWeightage(List<IndicatorUpdateData> lstUpdateData)
    {
        string ReturnMessage = "Insert/Updated Successfuly";
        int zeroRecord = 0;
        try
        {
            if (lstUpdateData.Count > 0)
            {
                XmlDocument doc = new XmlDocument();
                string CS = ConfigurationManager.ConnectionStrings["NewUMSConnectionString"].ConnectionString;


                XmlDeclaration declaire = doc.CreateXmlDeclaration("1.0", "utf-16", null);
                // -----------------------create root-----------------------------  
                XmlElement rootnode = doc.CreateElement("root");
                doc.InsertBefore(declaire, doc.DocumentElement);
                doc.AppendChild(rootnode);

                foreach (IndicatorUpdateData indicatorweightage in lstUpdateData)
                {
                    XmlElement AccreditationData = doc.CreateElement("WeightageData");
                    if (indicatorweightage != null)
                    {
                        if (indicatorweightage.Weightage != "0" && indicatorweightage.Weightage != "0.00" && indicatorweightage.Weightage != "")
                        {
                            XmlElement IndicatorId = doc.CreateElement("IndicatorId");
                            IndicatorId.InnerText = indicatorweightage.IndicatorId.ToString();
                            XmlElement Weightage = doc.CreateElement("Weightage");
                            Weightage.InnerText = indicatorweightage.Weightage.ToString();
                            XmlElement Session = doc.CreateElement("Session");
                            Session.InnerText = indicatorweightage.Session.ToString();
                            AccreditationData.AppendChild(IndicatorId);
                            AccreditationData.AppendChild(Weightage);
                            AccreditationData.AppendChild(Session);
                            doc.DocumentElement.AppendChild(AccreditationData);
                        }
                        else
                            zeroRecord++;
                    }

                }
                if (zeroRecord > 0)
                    ReturnMessage = "Weightage with values zero are not saved";
                SqlCommand sqlcmd = new SqlCommand();
                sqlcmd.Connection = con;
                con.Open();
                sqlcmd.CommandType = CommandType.StoredProcedure;
                sqlcmd.CommandText = "pInsertIndicatorWeightage";
                sqlcmd.Parameters.AddWithValue("@XMLData", doc.InnerXml.ToString());
                sqlcmd.Parameters.AddWithValue("@EntryBy", HttpContext.Current.Session["LoginName"].ToString());
                sqlcmd.ExecuteNonQuery();
                con.Close();
                //    }
                //}
            }
        }
        catch (Exception ex)
        {
            ReturnMessage = "Some Error Ocurred, Please try again ";

        }
        return ReturnMessage;
    }

    [WebMethod]
    public static string SaveCriteriaWeightage(List<CriteriaUpdateData> lstUpdateData)
    {
        string ReturnMessage = "Insert/Updated Successfuly";
        int zeroRecord = 0;
        try
        {
            if (lstUpdateData.Count > 0)
            {
                XmlDocument doc = new XmlDocument();

                XmlDeclaration declaire = doc.CreateXmlDeclaration("1.0", "utf-16", null);
                // -----------------------create root-----------------------------  
                XmlElement rootnode = doc.CreateElement("root");
                doc.InsertBefore(declaire, doc.DocumentElement);
                doc.AppendChild(rootnode);

                foreach (CriteriaUpdateData criteriaweightage in lstUpdateData)
                {
                    XmlElement AccreditationData = doc.CreateElement("WeightageData");
                    if (criteriaweightage != null)
                    {
                        if (criteriaweightage.Weightage != "0" && criteriaweightage.Weightage != "0.00" && criteriaweightage.Weightage != "")
                        {
                            XmlElement CriteriaId = doc.CreateElement("CriteriaId");
                            CriteriaId.InnerText = criteriaweightage.CriteriaId.ToString();
                            XmlElement Weightage = doc.CreateElement("Weightage");
                            Weightage.InnerText = criteriaweightage.Weightage.ToString();
                            XmlElement Session = doc.CreateElement("Session");
                            Session.InnerText = criteriaweightage.Session.ToString();
                            AccreditationData.AppendChild(CriteriaId);
                            AccreditationData.AppendChild(Weightage);
                            AccreditationData.AppendChild(Session);
                            doc.DocumentElement.AppendChild(AccreditationData);
                        }
                        else
                            zeroRecord++;
                    }

                }
                if (zeroRecord > 0)
                    ReturnMessage = "Weightage with values zero are not saved";
                SqlCommand sqlcmd = new SqlCommand();
                sqlcmd.Connection = con;
                con.Open();
                sqlcmd.CommandType = CommandType.StoredProcedure;
                sqlcmd.CommandText = "pInsertCriteriaWeightage";
                sqlcmd.Parameters.AddWithValue("@XMLData", doc.InnerXml.ToString());
                sqlcmd.Parameters.AddWithValue("@EntryBy", HttpContext.Current.Session["LoginName"].ToString());
                sqlcmd.ExecuteNonQuery();
                con.Close();
                //    }
                //}
            }
        }
        catch (Exception ex)
        {
            ReturnMessage = "Some Error Ocurred, Please try again ";

        }
        return ReturnMessage;
    }
    public class Metricdocs
    {
        public string Desc { get; set; }
        public string DocSource { get; set; }
        public string IsReq { get; set; }
        public int IsActive { get; set; }
        public int Id { get; set; }
    }
    [WebMethod]
    public static List<Metricdocs> GetMetricDoc(int MetricId)
    {
        List<Metricdocs> lstMetricdocs = new List<Metricdocs>();
        try
        {
            SqlCommand sqlcmd = new SqlCommand();
            sqlcmd.Connection = con;
            sqlcmd.CommandType = CommandType.Text;
            sqlcmd.CommandText = "SELECT DocumentId, DocumentDescription,ISNULL(DocumentSource,'') AS DocSource,ISNULL(IsRequired,0) AS IsRequired,IsActive FROM dbo.MetricDocuments WHERE DocumentType='V'  AND MetricId=@MetricId";
            sqlcmd.Parameters.AddWithValue("@MetricId", MetricId);

            if (con.State == ConnectionState.Closed)
                con.Open();
            using (SqlDataReader sdr = sqlcmd.ExecuteReader())
            {
                int Sn = 1;
                while (sdr.Read())
                {
                    string Req = "";
                    if (sdr["IsRequired"] != DBNull.Value)
                    {
                        if (Convert.ToInt32(sdr["IsRequired"]) == 1)
                            Req = "Yes";
                        else
                            Req = "No";


                    }
                    lstMetricdocs.Add(new Metricdocs
                    {

                        Id = Convert.ToInt32(sdr["DocumentId"]),
                        Desc = sdr["DocumentDescription"].ToString(),
                        DocSource = sdr["DocSource"].ToString(),
                        IsReq = Req,
                        IsActive = sdr["IsActive"] != DBNull.Value ? Convert.ToInt32(sdr["IsActive"]) : 1


                    });
                    Sn++;
                }
            }
        }
        catch (Exception ex)
        {

        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        return lstMetricdocs;
    }

    [WebMethod]
    public static string RenameDocListofVerification(int Id, string Desc, string Req, string Docsource)
    {
        string msg = "";

        try
        {
            if (msg == "")
            {
                msg = "Rename successfuly";
                SqlCommand sqlcmd = new SqlCommand();
                sqlcmd.Connection = con;
                sqlcmd.CommandType = CommandType.Text;
                sqlcmd.CommandText = "Update dbo.MetricDocuments set DocumentDescription=@Desc,IsRequired=@IsRequired,Entryby=@EntryBy,EntryDateTime=@EntryDate,DocumentSource=@DocumentSource where DocumentId=@Id";
                sqlcmd.Parameters.AddWithValue("@Id", Id);
                sqlcmd.Parameters.AddWithValue("@EntryBy", HttpContext.Current.Session["LoginName"].ToString());
                sqlcmd.Parameters.AddWithValue("@EntryDate", DateTime.Now.Date);
                sqlcmd.Parameters.AddWithValue("@Desc", Desc);
                sqlcmd.Parameters.AddWithValue("@IsRequired", Req);
                sqlcmd.Parameters.AddWithValue("@DocumentSource", Docsource);

                if (con.State == ConnectionState.Closed)
                    con.Open();
                sqlcmd.ExecuteNonQuery();
            }
        }
        catch (Exception ex)
        {
            msg = ex.Message.ToString();
            msg = msg.Replace("'", "");
            msg = msg.Replace("\r\n", "");
            Page page = (Page)HttpContext.Current.Handler;
            DisplayAJAXMessage(page, msg.ToString());

        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        return msg;
    }
    [WebMethod]
    public static string DeleteDoc(int Id, int IsActive, string Reason)
    {
        string msg = "";
        if (IsActive == 0)
            msg = "Deactive successfuly";
        else
            msg = "Active successfuly";
        try
        {
            SqlCommand sqlcmd = new SqlCommand();
            sqlcmd.Connection = con;
            sqlcmd.CommandType = CommandType.Text;
            sqlcmd.CommandText = "Update dbo.MetricDocuments set isactive=@IsActive,UpdatedBy=@UpdatedBy,ReasonToDeactive=@ReasonToDeactive,UpdatedOn=GetDate() where DocumentId=@Id";
            sqlcmd.Parameters.AddWithValue("@Id", Id);
            sqlcmd.Parameters.AddWithValue("@ReasonToDeactive", Reason);
            sqlcmd.Parameters.AddWithValue("@UpdatedBy", HttpContext.Current.Session["LoginName"].ToString());
            sqlcmd.Parameters.AddWithValue("@IsActive", IsActive);
            if (con.State == ConnectionState.Closed)
                con.Open();
            sqlcmd.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
            if (IsActive == 0)
                msg = "Error In Deactive";
            else
                msg = "Error in Active";
        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        return msg;
    }
    public class MetricAccreditationDetail
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int MetricId { get; set; }
        public Boolean IsActive { get; set; }
    }
    [WebMethod]
    public static List<MetricAccreditationDetail> GetMetricsAccreditation(int MetricId)
    {
        List<MetricAccreditationDetail> lstMetricAccrediation = new List<MetricAccreditationDetail>();
        try
        {
            SqlCommand sqlcmd = new SqlCommand();
            sqlcmd.Connection = con;
            sqlcmd.CommandType = CommandType.StoredProcedure;
            sqlcmd.CommandText = "pGetMetricAccreditationDetail";
            sqlcmd.Parameters.AddWithValue("@MetricId", MetricId);
            if (con.State == ConnectionState.Closed)
                con.Open();
            using (SqlDataReader sdr = sqlcmd.ExecuteReader())
            {
                int Sn = 1;
                while (sdr.Read())
                {
                    lstMetricAccrediation.Add(new MetricAccreditationDetail
                    {

                        Id = Convert.ToInt32(sdr["Id"]),
                        Name = sdr["Name"].ToString(),
                        MetricId = Convert.ToInt32(sdr["MetricId"]),
                        IsActive = Convert.ToBoolean(sdr["IsActive"])
                    });
                    Sn++;
                }
            }
        }
        catch (Exception ex)
        {

        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        return lstMetricAccrediation;
    }
    [WebMethod]
    public static string DeleteAccreditation(int Id, int IsActive)
    {
        string msg = "";
        if (IsActive == 0)
            msg = "Deactive successfuly";
        else
            msg = "Active successfuly";
        try
        {
            SqlCommand sqlcmd = new SqlCommand();
            sqlcmd.Connection = con;
            sqlcmd.CommandType = CommandType.Text;
            sqlcmd.CommandText = "Update dbo.MetricAccreditationMapping set isactive=@IsActive where Id=@Id";
            sqlcmd.Parameters.AddWithValue("@Id", Id);
            sqlcmd.Parameters.AddWithValue("@IsActive", IsActive);
            if (con.State == ConnectionState.Closed)
                con.Open();
            sqlcmd.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
            if (IsActive == 0)
                msg = "Error In Deactive";
            else
                msg = "Error in Active";
        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
        return msg;
    }


}