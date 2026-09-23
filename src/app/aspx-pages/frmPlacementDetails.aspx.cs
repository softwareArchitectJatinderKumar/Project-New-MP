using System;
using System.Data;
using System.Configuration;
using System.Web.UI.WebControls;
using System.Data.SqlClient;
using Microsoft.ApplicationBlocks.Data;
using Telerik.Web.UI;


public partial class frmPlacementDetails : BasePage
{

    SqlConnection conn = new SqlConnection(Convert.ToString(ConfigurationManager.ConnectionStrings["NewUMSConnectionString"]));
    SqlCommand cmd = new SqlCommand();
    protected void Page_Load(object sender, EventArgs e)
    {

        if (!string.IsNullOrEmpty(Convert.ToString(Session["LoginName"])))
        {
            CompanyFeedback objuser = new CompanyFeedback();
            DataSet dsCheck = new DataSet();
            dsCheck = objuser.GetUser(Session["LoginName"].ToString(), System.IO.Path.GetFileName(Request.Url.AbsolutePath));
            if (dsCheck.Tables.Count > 0)
            {
                if (dsCheck.Tables[0].Rows.Count > 0)
                {

                }
                else
                {
                    this.Form.Visible = false;
                    Response.Write("UnAuthorized Access");
                }

            }
            else
            {
                this.Form.Visible = false;
                Response.Write("UnAuthorized Access");
            }
        }
        else
        {
            Response.Redirect("RemoveSession.aspx");
        }
        if (!IsPostBack)
        {
            ddlBatchYear.SelectedValue = "2023";
            BindYear();
            Stream();

            // ddlSubStream.Items.Insert(0, new ListItem("All", "0"));
        }
    }
    public void Stream()
    {
        ddlStream.DataSource = GetStreamListing();
        ddlStream.DataTextField = "StreamName";
        ddlStream.DataValueField = "StreamId";
        ddlStream.DataBind();
        ddlStream.Items.Insert(0, new ListItem("Select Discipline", "0"));
    }

    public DataSet GetStreamListing()
    {
        SqlParameter[] arParms = new SqlParameter[2];
        arParms[0] = new SqlParameter("@ListType", "Stream");
        arParms[1] = new SqlParameter("@BatchYear", ddlBatchYear.SelectedValue);
        DataSet ds;
        ds = SqlHelper.ExecuteDataset(conn, CommandType.StoredProcedure, "pPlacementProgramMasterListing", arParms);
        return ds;
    }
    public void BindYear()
    {
        ddlBatchYear.DataSource = GetBatchYearListing();
        ddlBatchYear.DataTextField = "BatchYear";
        ddlBatchYear.DataValueField = "BatchYearId";
        ddlBatchYear.DataBind();
        // ddlBatch.Items.Insert(0, new ListItem("Select Batch Year", "0"));
    }
    public DataSet GetBatchYearListing()
    {
        SqlParameter[] arParms = new SqlParameter[1];
        arParms[0] = new SqlParameter("@ListType", "Batch");
        DataSet ds;
        ds = SqlHelper.ExecuteDataset(conn, CommandType.StoredProcedure, "pPlacementProgramMasterListing", arParms);
        return ds;

    }
    public void SubStream()
    {
        cbSubStream.DataSource = GetSubStreamListing();
        cbSubStream.DataTextField = "Name";
        cbSubStream.DataValueField = "Id";
        cbSubStream.DataBind();
        cbSubStream.Items.Insert(0, new ListItem("All", "0"));
    }

    public DataSet GetSubStreamListing()
    {
        //SqlParameter[] arParms = new SqlParameter[2];
        //arParms[0] = new SqlParameter("@ListType", "SubStream");
        //arParms[1] = new SqlParameter("@StreamId", Convert.ToInt32(ddlStream.SelectedValue));
        //DataSet ds;
        //ds = SqlHelper.ExecuteDataset(conn, CommandType.StoredProcedure, "pPlacementDriveMasterListing", arParms);
        //return ds;
        SqlParameter[] arParms = new SqlParameter[3];
        arParms[0] = new SqlParameter("@ListType", "SubStreamFeedback");
        arParms[1] = new SqlParameter("@StreamList", ddlStream.SelectedValue);
        arParms[2] = new SqlParameter("@BatchYear", ddlBatchYear.SelectedValue);
        DataSet ds;
        ds = SqlHelper.ExecuteDataset(conn, CommandType.StoredProcedure, "pPlacementDriveMasterListing", arParms);
        return ds;
    }
    protected void btnExportToExcel_Click(object sender, EventArgs e)
    {
        try
        {
            gvDriveDetails.MasterTableView.AllowPaging = false;
            //gvDriveDetails.Rebind();
            BindGrid();
            gvDriveDetails.ExportSettings.FileName = "PlacementDetails";
            gvDriveDetails.ExportSettings.OpenInNewWindow = true;
            gvDriveDetails.MasterTableView.ExportToExcel();
        }
        catch (Exception ex)
        {

        }
    }

    protected void BindGrid()
    {

        System.Text.StringBuilder sb = new System.Text.StringBuilder();
        hfsubstream.Value = "0";
        if (trSubStream.Visible == true)
        {
            for (int i = 0; i < cbSubStream.Items.Count; i++)
            {
                if (cbSubStream.Items[i].Selected)
                {
                    sb.Append(cbSubStream.Items[i].Value);
                    sb.Append(",");
                    hfsubstream.Value = sb.ToString().Substring(0, sb.ToString().Length - 1);
                }
            }
        }
        btnExportToExcel.Visible = true;
        gvDriveDetails.DataSourceID = null;
        gvDriveDetails.DataSource = null;
        SqlParameter[] DLParms = new SqlParameter[3];
        DLParms[0] = new SqlParameter("@BatchYear", ddlBatchYear.SelectedValue);
        DLParms[1] = new SqlParameter("@StreamId", Convert.ToInt32(ddlStream.SelectedValue));

        DLParms[2] = new SqlParameter("@SubStreamId", hfsubstream.Value);
        DataSet dsDriveLocked = new DataSet();
        //ds = SqlHelper.ExecuteDataset(conn, CommandType.StoredProcedure, "pPlacementMasterRegistrationDataListing", paramDriveRegistrationData);

        //cmd.Parameters.Add(paramDriveRegistrationData);
        cmd.Connection = conn;
        cmd.CommandType = CommandType.StoredProcedure;

        cmd.CommandText = "pGetPlacementDetailsByCompany";

        cmd.CommandTimeout = 0;
        for (int i = 0; i <= 2; i++)
        {
            cmd.Parameters.Add(DLParms[i]);
        }
        SqlDataAdapter adt = new SqlDataAdapter(cmd);
        //DataSet ds = new DataSet();
        adt.Fill(dsDriveLocked);
        // DataSet dsDriveLocked = SqlHelper.ExecuteDataset(conn, CommandType.StoredProcedure, "[pGetPlacementDetailsByCompany]", DLParms);
        gvDriveDetails.DataSource = dsDriveLocked;
        gvDriveDetails.DataBind();

    }


    protected void gvDriveDetails_PageIndexChanged(object source, Telerik.Web.UI.GridPageChangedEventArgs e)
    {
        BindGrid();
    }
    //protected void ddlCompanies_SelectedIndexChanged(object sender, EventArgs e)
    //{
    //    BindGrid();
    //}
    //protected void ddlBatchYear_SelectedIndexChanged(object sender, EventArgs e)
    //{
    //    Stream();
    //    BindGrid();
    //    //if (Convert.ToInt32(ddlBatchYear.SelectedValue) > 2014)
    //    //{
    //    //    trSubStream.Visible = false;
    //    //}
    //}
    protected void ddlStream_SelectedIndexChanged(object sender, EventArgs e)
    {
        //if (Convert.ToInt32(ddlBatchYear.SelectedValue) <= 2014)
        //{
        //    trSubStream.Visible = true;
        SubStream();
        //}
        //else
        //{
        //    trSubStream.Visible = false;
        //}
        //BindGrid();
    }
    //protected void cbSubStream_SelectedIndexChanged(object sender, EventArgs e)
    //{
    //    BindGrid();
    //}

    protected void gvDriveDetails_ItemDataBound(object sender, Telerik.Web.UI.GridItemEventArgs e)
    {
        if (e.Item is GridDataItem)
        {
            HyperLink hyplnk = (HyperLink)e.Item.FindControl("hypDetails");
            Label lblDriveID = (Label)e.Item.FindControl("lblDriveId");
            EncryptDecryptPlacement.MyEncryptor encrypt = new EncryptDecryptPlacement.MyEncryptor(string.Empty);
            string driveid = Server.UrlDecode(encrypt.Encrypt(lblDriveID.Text));
            hyplnk.NavigateUrl = "DriveDetails.aspx?id=" + driveid;
        }
    }
    protected void btnShow_Click(object sender, EventArgs e)
    {
        BindGrid();
    }
    protected void ddlBatchYear_SelectedIndexChanged(object sender, EventArgs e)
    {
        Stream();
    }
}
