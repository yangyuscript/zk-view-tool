var Zookeeper = require('node-zookeeper-client')
var CONNECTION_STRING = "127.0.0.1:2181"
var OPTIONS = {
    sessionTimeout: 5000
}
var zk = Zookeeper.createClient(CONNECTION_STRING, OPTIONS)
zk.connect()

function connectZK(callback) {
    zk.on('connected', function () {
        console.log("connected zk:", zk)
        const newChild = { label: CONNECTION_STRING, children: [], path: '/' }
        listChildren(zk,'/',newChild,callback,newChild)
    });
}

function listChildren(client, path, map,callback,ret) {
    client.getChildren(
        path,
        function (event) {
            console.log('Got watcher event: %s', event);
            //listChildren(client, path, tree);
        },
        function (error, children, stat) {
            if (error) {
                console.log('Failed to list children of %s due to: %s.',path,error)
                return;
            }
            console.log('Children of %s are: %j.', path, children);
            children.forEach(element => {
                var array = map.children
                var childPath = path == '/' ? path + element : path + '/' + element
                const child = { label: element, children: [], path: childPath }
                array.push(child)
                console.log('parent path is %s', path)
                console.log('child path is %s', childPath)
                listChildren(client, childPath, child, callback, ret)
                callback(ret)
            });
        }
    );
}

function exists(client, path) {
    client.exists(path, function (error, stat) {
        if (error) {
            console.log(error.stack);
            return false;
        }

        if (stat) {
            console.log('Node exists.');
            return true;
        } else {
            console.log('Node does not exist.');
            return false;
        }
    });
}

function getNodeData(path,callback) {
    zk.getData(
        path,
        function (event) {
            console.log('Got event: %s.', event);
        },
        function (error, data, stat) {
            if (error) {
                console.log(error.stack);
                return;
            }
     
            console.log('Got data: %s', data);
            callback(data);
        }
    );
}

function sleep(d) {
    for (var t = Date.now(); Date.now() - t <= d;);
}

export default {
    connectZK,
    getNodeData
}