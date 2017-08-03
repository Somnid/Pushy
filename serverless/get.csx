using System.Net;
using Dapper;
using System.Data.SqlClient;
using System.Configuration;

public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, TraceWriter log)
{
    log.Info("C# HTTP trigger function processed a request.");

    // Get request body
    dynamic data = await req.Content.ReadAsAsync<object>();

    var result = string.Empty;
    var successful = true;
    try
    {
        var connectionString  = ConfigurationManager.ConnectionStrings["---"].ConnectionString;
        
        using(var connection = new SqlConnection(connectionString))
        {
            connection.Open();
            
            // insert a log to the database
            connection.Execute(@"
                DELETE FROM Users WHERE Name = @Name
                INSERT INTO Users (Name, Data) VALUES (@Name, @Data)
            "
                , new User {
                    Data = data.data,
                    Name = data.name
                }
            );
            result = "User added to database successfully!";
        }
    }
    catch(Exception ex)
    {
        successful = false;
        result = "failed:" + ex.ToString();
    }

    return req.CreateResponse(successful ? HttpStatusCode.OK : HttpStatusCode.BadRequest, result);
}

class User {
    public string Data { get;set; }
    public string Name { get;set; }
}