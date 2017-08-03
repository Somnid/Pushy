using System.Net;
using WebPush;
using Dapper;
using System.Data.SqlClient;
using System.Configuration;
using Newtonsoft.Json;

public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, TraceWriter log)
{
    log.Info("C# HTTP trigger function processed a request.");

    // Get request body
    const string publicKey = "---";
    var data = await req.Content.ReadAsAsync<RequestBody>();
    var result = string.Empty;
    var successful = true;

    try
    {
        var connectionString  = ConfigurationManager.ConnectionStrings["---"].ConnectionString;
        using(var connection = new SqlConnection(connectionString))
        {
            connection.Open();
            
            // insert a log to the database
            var subscriptionJson = connection.ExecuteScalar<string>(
                @"SELECT Data FROM Users WHERE Name = @Name", 
                new {
                    Name = data.Name
                }
            );

            log.Info("json: " + subscriptionJson);
            dynamic subscription = JsonConvert.DeserializeObject(subscriptionJson);
            log.Info($"endpoint: {subscription.endpoint}, pd256dh: {subscription.keys.p256dh}, auth: {subscription.keys.auth}");
            var pushSubscription = new PushSubscription(subscription.endpoint.ToString(), subscription.keys.p256dh.ToString(), subscription.keys.auth.ToString());
            var vapidDetails = new VapidDetails("mailto:test@gmail.com", publicKey, privateKey);
            var webPushClient = new WebPushClient();
            try {
                webPushClient.SendNotification(pushSubscription, data.Data, vapidDetails);
            } catch(Exception ex){
                log.Info(ex.ToString());
            }
            result = "Push Sent!";
        }
    }
    catch(Exception ex)
    {
        successful = false;
        result = "failed:" + ex.ToString();
    }

    return req.CreateResponse(successful ? HttpStatusCode.OK : HttpStatusCode.BadRequest, result);
} 

class RequestBody {
    public string Name { get;set;}
    public string Data { get;set;}
}