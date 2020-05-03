var zkClientMap = new Map()
var Zookeeper = require('node-zookeeper-client')
var OPTIONS = {
    sessionTimeout: 30000
}

function connectZK(callback) {
    var connects = localStorage.getItem('zkNames')
    if (connects != null && '' != connects) {
        if (connects.indexOf('$') == -1) {
            connectZKByName(connects, callback)
        } else {
            connects.split('$').forEach(element => {
                if (element != null && '' != element) {
                    var zk = zkClientMap.get(element)
                    if (zk == null) {
                        zk = Zookeeper.createClient(element, OPTIONS)
                        zkClientMap.set(element, zk)
                    }
                    zk.connect()
                    zk.on('connected', function () {
                        console.log("connected zk:", zk)
                        const newChild = { label: element, children: [], path: '/', zkName: element }
                        listChildren(zk, '/', newChild, callback, newChild, element)
                    });
                }
            });
        }
    }
}

function connectZKByName(zkName, callback) {
    var CONNECTION_STRING = zkName
    var zk = zkClientMap.get(zkName)
    if (zk == null) {
        zk = Zookeeper.createClient(CONNECTION_STRING, OPTIONS)
        zkClientMap.set(CONNECTION_STRING, zk)
        zk.connect()
        zk.on('connected', function () {
            console.log("connectZKByName connected zk:", zk)
            const newChild = { label: CONNECTION_STRING, children: [], path: '/', zkName: zkName }
            listChildren(zk, '/', newChild, callback, newChild, zkName)
        });
    } else {
        console.log("connectZKByName connected zk:", zk)
        const newChild = { label: CONNECTION_STRING, children: [], path: '/', zkName: zkName }
        listChildren(zk, '/', newChild, callback, newChild, zkName)
    }
}

function listChildren(client, path, map, callback, ret, zkName) {
    client.getChildren(
        path,
        function (event) {
            console.log('Got watcher event: %s', event);
            //listChildren(client, path, tree);
        },
        function (error, children, stat) {
            if (error) {
                console.log('Failed to list children of %s due to: %s.', path, error)
                return;
            }
            //console.log('Children of %s are: %j.', path, children);
            children.forEach(element => {
                var array = map.children
                var childPath = path == '/' ? path + element : path + '/' + element
                const child = { label: element, children: [], path: childPath, zkName: zkName }
                array.push(child)
                //console.log('parent path is %s', path)
                //console.log('child path is %s', childPath)
                listChildren(client, childPath, child, callback, ret, zkName)
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

function getNodeData(zkName, path, callback) {
    var zk = zkClientMap.get(zkName)
    if (zk != null) {
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
                //console.log('Got data: %s', data);
                //console.log("stat", JSON.stringify(stat))
                //console.log("stat", stat.czxid.toString('hex'))
                //console.log("stat", stat.ctime.toString('UTF-8'))
                //console.log("stat",trans(stat.czxid))
                callback(data);
            }
        );
    }
}

function sleep(d) {
    for (var t = Date.now(); Date.now() - t <= d;);
}

export default {
    connectZK,
    getNodeData,
    connectZKByName
}