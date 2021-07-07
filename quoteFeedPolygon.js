//Christopher Poole sample implementation of cryptocurrency quote feed from Polygon.
//format of the Polygon Aggregates (Bars) API call: https://api.polygon.io/v2/aggs/ticker/{cryptoTicker}/range/{multiplier}/{timespan}/{from}/{to}?unadjusted=true&sort=asc&limit=120&apiKey={key}
var quoteFeedPolygon = {}; // the quotefeed object
var fetchDataRecordLimit = 10000; //sets a record return limit for each of the calls to the Polygon API.
quoteFeedPolygon.apiKey = "QK_JqTW92AHnFL4C8xApU0Md_tU5NJul"  //my polygon account authentication key for this specific API

// utility function to format received data into a form accepted by the charts
quoteFeedPolygon.formatFeedData = function (dataResults) {
	var formattedDataResults = [];
	if (dataResults.length > 0) {
		for (var i = 0; i < dataResults.length; i++) {
			const milliseconds = dataResults[i].t;
			const dateObject = new Date(milliseconds); //convert Unix Msec timestamp to usable Date format
			const mappedData = { DT: dateObject, Close: dataResults[i].c, Open: dataResults[i].o, High: dataResults[i].h, Low: dataResults[i].l, Volume: dataResults[i].v }
			formattedDataResults.push(mappedData);
		}
	}
	console.log(formattedDataResults)//for testing purposes
	return formattedDataResults;
}

//My polygon call to fetch InitialData for chart load.
quoteFeedPolygon.fetchInitialData = function (symbol, suggestedStartDate, suggestedEndDate, params, cb) {
	console.log("fetchInitialData was triggered..." + "StartDate Used: " + suggestedStartDate + ", EndDate Used: " + suggestedEndDate)
	//URL string creation for call to Polygon Aggregates (Bars) API. See top of quoteFeedPolygon.js for URL format template.
	var formattedStartDate = suggestedStartDate.toISOString(); formattedStartDate = formattedStartDate.slice(0, -14);
	var formattedEndDate = new Date().toISOString(); formattedEndDate = formattedEndDate.slice(0, -14); //set initial end date to today
	var queryURL = "https://api.polygon.io/v2/aggs/ticker/";//base URL before adding parameters
	queryURL += symbol + "/range/" + params.period + "/" + params.interval + "/" + formattedStartDate + "/" + formattedEndDate;
	queryURL += "?unadjusted=true" + "&sort=asc" + "&limit=" + fetchDataRecordLimit + "&apiKey=" + quoteFeedPolygon.apiKey;

	//using the Fetch API method for making the call to the Polygon API and returning a Promise<Response> and results and passing to my custom function to format the data for ChartIQ
	fetch(queryURL)
		.then(response => {
			if (!response.ok) {
				throw new Error('Polygon API response code: ' + response.status); //will provide the error status code		
			}
			return response;
		})
		.then(response => response.json())
		.then(parsedJson => {
			var formattedResults = quoteFeedPolygon.formatFeedData(parsedJson.results)
			cb({
				quotes: formattedResults,
				
			}); // return the fetched data to chart via callback
		})
		.catch(error => {
			cb({
				error: error,
				
			});
		})

	//improvements: add error response handling from the API.

};// end fetchInitialData

//NOT APPLICABLE (fetchUpdateData) - given the data feed I am accessing only provides EOD updates, I do not need the fetchUpdateData function to pull "current data".
//quoteFeedPolygon.fetchUpdateData = function (symbol, suggestedStartDate, params, cb) {}


/* temporary comment out while troubleshooting infinite load

//My polygon call to fetch PaginationData to support historical scrolling
quoteFeedPolygon.fetchPaginationData = function (symbol, suggestedStartDate, suggestedEndDate, params, cb) {
	console.log("fetchPaginationData was triggered..." + "StartDate Used: " + suggestedStartDate + ", EndDate Used: " + suggestedEndDate)
	//URL string creation for call to Polygon Aggregates (Bars) API. See top of quoteFeedPolygon.js for URL format template.
	var formattedStartDate = suggestedStartDate.toISOString(); formattedStartDate = formattedStartDate.slice(0, -14);
	var formattedEndDate = suggestedEndDate.toISOString(); formattedEndDate = formattedEndDate.slice(0, -14);
	var queryURL = "https://api.polygon.io/v2/aggs/ticker/";//base URL before adding parameters
	queryURL += symbol + "/range/" + params.period + "/" + params.interval + "/" + formattedStartDate + "/" + formattedEndDate;
	queryURL += "?unadjusted=true" + "&sort=asc" + "&limit=" + fetchDataRecordLimit + "&apiKey=" + quoteFeedPolygon.apiKey;

	//using the Fetch API method for making the call to the Polygon API and returning a Promise<Response> and results and passing to my custom function to format the data for ChartIQ
	fetch(queryURL)
		.then(response => {
			if (!response.ok) {
				throw new Error("API returned non 200 range code");
			}
			return response;
		})
		.then(response => response.json())
		.then(parsedJson => {
			var formattedResults = quoteFeedPolygon.formatFeedData(parsedJson.results)
			cb({
				quotes: formattedResults,
				moreAvailable: false
			}); // return the fetched data to chart via callback
		})
		.catch(error => {
			console.log('fetch data error:', error)
			cb({
				error: error,
			});
		})
};// end fetchPaginationData

*/

export default quoteFeedPolygon;