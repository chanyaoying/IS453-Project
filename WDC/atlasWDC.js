function main() {
    var myConnector = tableau.makeConnector();

    myConnector.getSchema = function (schemaCallback) {

        const inputs = JSON.parse(tableau.connectionData)
        const tickers = inputs.tickers;

        // Test table
        const test_cols = [{
                id: "ticker",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "weight",
                alias: "Weight",
                dataType: tableau.dataTypeEnum.float
            },
            {
                id: "amount",
                alias: "Amount",
                dataType: tableau.dataTypeEnum.float
            }
        ];
        const testSchema = {
            id: "portfolioTest",
            alias: "Initial portfolio allocation (test)",
            columns: test_cols
        };

        // Auto ARIMA
        const arima_cols = [{
                id: "ticker",
                dataType: tableau.dataTypeEnum.string
            },
            {
                id: "date",
                dataType: tableau.dataTypeEnum.date
            },
            {
                id: "predictionPrice",
                alias: "Price",
                dataType: tableau.dataTypeEnum.float
            },
            // {
            //     id: "predicted",
            //     alias: "Predicted?",
            //     dataType: tableau.dataTypeEnum.integer
            // }
        ]
        const arimaSchema = {
            id: "arimaPrediction",
            alias: `Auto ARIMA for ${tickers.join()}`,
            columns: arima_cols
        }

        // Add schemas
        schemaCallback([testSchema, arimaSchema]);
    };

    myConnector.getData = function (table, doneCallback) {
        const inputs = JSON.parse(tableau.connectionData)
        const tickers = inputs.tickers;
        const amounts = inputs.amounts;
        const analyses = inputs.analyses;

        const schemaTranslationTable = {
            "Test": "portfolioTest",
            "Price Prediction (Auto ARIMA)": "arimaPrediction"
        }

        const activeSchemas = analyses.map(x => schemaTranslationTable[x])

        for (const activeSchema of activeSchemas) {
            if (table.tableInfo.id === activeSchema) {
                const apiCall = `http://localhost:5000/${activeSchema}/${tickers}/${amounts}`;
                $.getJSON(apiCall, function (response) {
                    const tableData = response.data;
                    table.appendRows(tableData);
                    doneCallback();
                })
            }
        }
    };

    tableau.registerConnector(myConnector);

    $(document).ready(function () {

        $("#ATLASsubmitButton").click(function () {
            const inputs = JSON.parse($("#allInputs").text())
            const connectionName = `${inputs.analyses.join()} of ${inputs.tickers.join()}`;
            tableau.connectionData = JSON.stringify(inputs);
            tableau.connectionName = connectionName;
            tableau.submit();
        });
    });

};

main()