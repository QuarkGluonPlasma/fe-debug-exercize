const ws = require('ws');

const wss = new ws.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
    ws.on('message', function message(data) {
        console.log('received: %s', data);

        const message = JSON.parse(data);
        if (message.method === 'DOM.getDocument') {
            ws.send(JSON.stringify({
                id: message.id,
                result: {
                    root: {
                        nodeId: 1,
                        backendNodeId: 1,
                        nodeType: 9,
                        nodeName: "#document",
                        localName: "",
                        nodeValue: "",
                        childNodeCount: 2,
                        children: [
                            {
                                nodeId: 2,
                                parentId: 1,
                                backendNodeId: 2,
                                nodeType: 10,
                                nodeName: "html",
                                localName: "",
                                nodeValue: "",
                                publicId: "",
                                systemId: ""
                            },
                            {
                                nodeId: 3,
                                parentId: 1,
                                backendNodeId: 3,
                                nodeType: 1,
                                nodeName: "HTML",
                                localName: "html",
                                nodeValue: "",
                                childNodeCount: 2,
                                children: [
                                    {
                                        nodeId: 4,
                                        parentId: 3,
                                        backendNodeId: 4,
                                        nodeType: 1,
                                        nodeName: "HEAD",
                                        localName: "head",
                                        nodeValue: "",
                                        childNodeCount: 5,
                                        attributes: []
                                    },
                                    {
                                        nodeId: 5,
                                        parentId: 3,
                                        backendNodeId: 5,
                                        nodeType: 1,
                                        nodeName: "BODY",
                                        localName: "body",
                                        nodeValue: "",
                                        childNodeCount: 1,
                                        attributes: []
                                    }
                                ],
                                attributes: [
                                    "lang",
                                    "en"
                                ],
                                frameId: "3A70524AB6D85341B3B613D81FDC2DDE"
                            }
                        ],
                        documentURL: "http://127.0.0.1:8085/",
                        baseURL: "http://127.0.0.1:8085/",
                        xmlVersion: "",
                        compatibilityMode: "NoQuirksMode"
                    }
                }
            }));

            ws.send(JSON.stringify({
                method: "DOM.setChildNodes",
                params: {
                    nodes: [
                        {
                            attributes: [
                                "class",
                                "guang"
                            ],
                            backendNodeId: 6,
                            childNodeCount: 0,
                            children: [
                                {
                                    backendNodeId: 6,
                                    localName: "",
                                    nodeId: 7,
                                    nodeName: "#text",
                                    nodeType: 3,
                                    nodeValue: "光光光",
                                    parentId: 6,
                                }
                            ],
                            localName: "p",
                            nodeId: 6,
                            nodeName: "P",
                            nodeType: 1,
                            nodeValue: "",
                            parentId: 5
                        }
                    ],
                    parentId: 5
                }
            }));
        } else if (message.method === 'DOM.requestChildNodes') {
            ws.send(JSON.stringify({
                id: message.id,
                result: {}
            }));
        }
    });

    ws.send(JSON.stringify({
        method: "Network.requestWillBeSent",
        params: {
            requestId: `111`,
            frameId: '123.2',
            loaderId: '123.67',
            request: {
                url: 'www.guangguangguang.com',
                method: 'post',
                headers: {
                    "Content-Type": "text/html"
                },
                initialPriority: 'High',
                mixedContentType: 'none',
                postData: {
                    "guang": 1
                }
            },
            timestamp: Date.now(),
            wallTime: Date.now() - 10000,
            initiator: {
                type: 'other'
            },
            type: "Document"
        }
    }));
});

