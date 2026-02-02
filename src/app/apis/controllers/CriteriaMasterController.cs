/**
 * Criteria Master Web API Controller
 * Refactored from frmCriteriaMaster.aspx.cs code-behind logic
 */
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Http;
using Microsoft.ApplicationBlocks.Data;

[RoutePrefix("api/CriteriaMaster")]
public class CriteriaMasterController : ApiController
{
    private string constr = System.Configuration.ConfigurationManager.ConnectionStrings["NewUMSConnectionString"].ToString();
    
    [HttpGet]
    [Route("GetDivisions")]
    public IHttpActionResult GetDivisions()
    {
        try
        {
            DataSet ds = new DataSet();
            SqlParameter[] param = new SqlParameter[1];
            param[0] = new SqlParameter("@type", "getDivision");
            
            ds = SqlHelper.ExecuteDataset(constr, CommandType.StoredProcedure, "pCriteriaMappingWithKeyIndicator", param);
            
            var divisions = ds.Tables[0].AsEnumerable().Select(row => new
            {
                Id = row.Field<int>("Id"),
                Name = row.Field<string>("Name")
            }).ToList();
            
            return Ok(divisions);
        }
        catch (Exception ex)
        {
            return InternalServerError(ex);
        }
    }
    
    [HttpGet]
    [Route("GetCriterias")]
    public IHttpActionResult GetCriterias(int divisionId)
    {
        try
        {
            DataSet ds = new DataSet();
            SqlParameter[] param = new SqlParameter[3];
            param[0] = new SqlParameter("@type", "getCriteria");
            param[1] = new SqlParameter("@DivisionId", divisionId);
            
            ds = SqlHelper.ExecuteDataset(constr, CommandType.StoredProcedure, "pCriteriaMappingWithKeyIndicator", param);
            
            var criterias = ds.Tables[0].AsEnumerable().Select(row => new
            {
                Id = row.Field<int>("Id"),
                CriteriaDesc = row.Field<string>("Name"),
                ISActive = row.Field<bool>("IsActive"),
                Weightage = row.Field<decimal?>("Weightage") ?? 0
            }).ToList();
            
            return Ok(criterias);
        }
        catch (Exception ex)
        {
            return InternalServerError(ex);
        }
    }
    
    [HttpGet]
    [Route("GetCriteriaById")]
    public IHttpActionResult GetCriteriaById(int id)
    {
        try
        {
            using (SqlConnection con = new SqlConnection(constr))
            {
                con.Open();
                DataSet ds = new DataSet();
                SqlDataAdapter da = new SqlDataAdapter("SELECT * FROM KRAKPICriterMaster WHERE Id = @Id", con);
                da.SelectCommand.Parameters.AddWithValue("@Id", id);
                da.Fill(ds);
                
                if (ds.Tables[0].Rows.Count > 0)
                {
                    var criteria = new
                    {
                        Id = Convert.ToInt32(ds.Tables[0].Rows[0]["Id"]),
                        CriteriaDesc = ds.Tables[0].Rows[0]["description"].ToString(),
                        ISActive = Convert.ToBoolean(ds.Tables[0].Rows[0]["IsActive"]),
                        DivisionId = Convert.ToInt32(ds.Tables[0].Rows[0]["DivisionId"])
                    };
                    return Ok(criteria);
                }
                return NotFound();
            }
        }
        catch (Exception ex)
        {
            return InternalServerError(ex);
        }
    }
    
    [HttpPost]
    [Route("SaveCriteria")]
    public IHttpActionResult SaveCriteria([FromBody] CriteriaModel model)
    {
        try
        {
            using (SqlConnection con = new SqlConnection(constr))
            {
                con.Open();
                
                // Check if criteria already exists
                SqlDataAdapter da = new SqlDataAdapter("SELECT * FROM KRAKPICriterMaster WHERE description=@desc AND DivisionId=@div AND IsActive=1", con);
                da.SelectCommand.Parameters.AddWithValue("@desc", model.CriteriaDesc.Trim());
                da.SelectCommand.Parameters.AddWithValue("@div", model.DivisionId);
                DataSet ds = new DataSet();
                da.Fill(ds);
                
                if (ds.Tables[0].Rows.Count > 0)
                {
                    return BadRequest("Criteria '" + model.CriteriaDesc + "' already exists. Please enter a different criteria.");
                }
                
                SqlCommand cmd = new SqlCommand();
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandText = "pSaveCriteria";
                cmd.Connection = con;
                cmd.Parameters.AddWithValue("@type", "saveCriteria");
                cmd.Parameters.AddWithValue("@Criteria", model.CriteriaDesc.Trim());
                cmd.Parameters.AddWithValue("@DivisionId", model.DivisionId);
                cmd.Parameters.AddWithValue("@EntryBy", "29116"); // Session["LoginName"]
                cmd.ExecuteNonQuery();
                
                return Ok(new { message = "Successfully Submitted..." });
            }
        }
        catch (Exception ex)
        {
            return InternalServerError(ex);
        }
    }
    
    [HttpPost]
    [Route("RenameCriteria")]
    public IHttpActionResult RenameCriteria([FromBody] RenameCriteriaModel model)
    {
        try
        {
            using (SqlConnection con = new SqlConnection(constr))
            {
                con.Open();
                
                SqlCommand cmd = new SqlCommand();
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandText = "pSaveCriteria";
                cmd.Connection = con;
                cmd.Parameters.AddWithValue("@type", "updateCriteria");
                cmd.Parameters.AddWithValue("@CriteriaId", model.CriteriaId);
                cmd.Parameters.AddWithValue("@Criteria", model.Desc.Trim());
                cmd.Parameters.AddWithValue("@DivisionId", model.DivId);
                cmd.Parameters.AddWithValue("@EntryBy", "29116");
                cmd.ExecuteNonQuery();
                
                return Ok(new { message = "Rename successfuly" });
            }
        }
        catch (Exception ex)
        {
            return InternalServerError(ex);
        }
    }
    
    [HttpPost]
    [Route("DeactivateCriteria")]
    public IHttpActionResult DeactivateCriteria([FromBody] IdModel model)
    {
        try
        {
            using (SqlConnection con = new SqlConnection(constr))
            {
                con.Open();
                
                SqlCommand cmd = new SqlCommand();
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandText = "pSaveCriteria";
                cmd.Connection = con;
                cmd.Parameters.AddWithValue("@type", "deactivateCriteria");
                cmd.Parameters.AddWithValue("@CriteriaId", model.Id);
                cmd.Parameters.AddWithValue("@EntryBy", "29116");
                cmd.ExecuteNonQuery();
                
                return Ok(new { message = "Criteria deactivated successfully" });
            }
        }
        catch (Exception ex)
        {
            return InternalServerError(ex);
        }
    }
    
    [HttpPost]
    [Route("ActivateCriteria")]
    public IHttpActionResult ActivateCriteria([FromBody] IdModel model)
    {
        try
        {
            using (SqlConnection con = new SqlConnection(constr))
            {
                con.Open();
                
                SqlCommand cmd = new SqlCommand();
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandText = "pSaveCriteria";
                cmd.Connection = con;
                cmd.Parameters.AddWithValue("@type", "activateCriteria");
                cmd.Parameters.AddWithValue("@CriteriaId", model.Id);
                cmd.Parameters.AddWithValue("@EntryBy", "29116");
                cmd.ExecuteNonQuery();
                
                return Ok(new { message = "Criteria activated successfully" });
            }
        }
        catch (Exception ex)
        {
            return InternalServerError(ex);
        }
    }
    
    [HttpPost]
    [Route("UploadCriteriaFile")]
    public IHttpActionResult UploadCriteriaFile()
    {
        try
        {
            var httpRequest = HttpContext.Current.Request;
            
            if (httpRequest.Files.Count > 0)
            {
                var postedFile = httpRequest.Files[0];
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(postedFile.FileName);
                var folderPath = System.Configuration.ConfigurationManager.AppSettings["FolderPath"];
                var filePath = HttpContext.Current.Server.MapPath(folderPath + "/" + fileName);
                
                postedFile.SaveAs(filePath);
                
                // Process Excel file
                DataTable dt = ExcelLibrary.DataSetHelper.CreateDataTable(filePath, "Sheet1");
                ArrayList errorList = new ArrayList();
                bool isError = false;
                var criterias = new List<Dictionary<string, object>>();
                
                for (int i = 0; i < dt.Rows.Count; i++)
                {
                    string criteriaValue = dt.Rows[i]["Criteria"].ToString();
                    
                    if (!Regex.IsMatch(criteriaValue, "^[ A-Za-z0-9-&()]*$"))
                    {
                        errorList.Add(" Invalid Value in Row- " + (i + 1) + " Special characters are not allowed, except -()& Column-Criteria");
                        isError = true;
                    }
                    else
                    {
                        criterias.Add(new Dictionary<string, object>
                        {
                            { "Criteria", criteriaValue },
                            { "RowNumber", i + 1 }
                        });
                    }
                }
                
                File.Delete(filePath);
                
                if (isError)
                {
                    return Ok(new { hasErrors = true, errors = errorList, criterias = criterias });
                }
                else
                {
                    return Ok(new { hasErrors = false, criterias = criterias, message = "File uploaded successfully" });
                }
            }
            else
            {
                return BadRequest("No file uploaded");
            }
        }
        catch (Exception ex)
        {
            return InternalServerError(ex);
        }
    }
    
    [HttpDelete]
    [Route("DeleteCriteria")]
    public IHttpActionResult DeleteCriteria(int id)
    {
        try
        {
            using (SqlConnection con = new SqlConnection(constr))
            {
                con.Open();
                
                SqlCommand cmd = new SqlCommand();
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandText = "pSaveCriteria";
                cmd.Connection = con;
                cmd.Parameters.AddWithValue("@type", "deleteCriteria");
                cmd.Parameters.AddWithValue("@CriteriaId", id);
                cmd.ExecuteNonQuery();
                
                return Ok(new { message = "Criteria deleted successfully" });
            }
        }
        catch (Exception ex)
        {
            return InternalServerError(ex);
        }
    }
}

// Model classes
public class CriteriaModel
{
    public string CriteriaDesc { get; set; }
    public int DivisionId { get; set; }
    public bool IsActive { get; set; }
}

public class RenameCriteriaModel
{
    public int CriteriaId { get; set; }
    public string Desc { get; set; }
    public int DivId { get; set; }
}

public class IdModel
{
    public int Id { get; set; }
}
