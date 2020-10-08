var BreakException = {},
    Plugin = {
        dbs: {
            db: null,
            code: null,
            open: function () {
                let dbSize = 5 * 1024 * 1024; // 5MB ( you can increase to whatever volume you want)

                this.db = openDatabase("plugin", "1", "saves all links", dbSize);
            },
            onError: function (tx, e) {
                alert("There has been an error: " + e.message);
            },
            onSuccess: function (tx, r) {
                alert("success");
            },
            createTable: function () {
                this.db.transaction(function (tx) {
                    tx.executeSql("CREATE TABLE IF NOT EXISTS plugin(ID INTEGER PRIMARY KEY ASC,key VARCHAR(255), added_on DATETIME)", []);
                });
            },
            addKey: function (key) {
                let addedOn = new Date();

                this.db.transaction(function (tx) {
                    tx.executeSql("INSERT INTO plugin(key, added_on) VALUES (?,?)",
                        [key, addedOn],
                        this.onSuccess,
                        this.onError);
                });

                this.getKeys();
            },
            getKeys: function () {
                this.db.transaction(function (tx) {
                    tx.executeSql("SELECT * FROM plugin ORDER BY ID DESC", [], function (tx, results) {
                            let len = results.rows.length;
                            if (len >= 1) {
                                $('#apiKey').val(results.rows.item(0)['key']).trigger('change');
                            }
                        },
                        this.onError);
                });
            }
        },
        api: {
            checkApiKey: function (key) {

            },
            sendNewSite: function (url, title, image, key) {
                let data = Plugin.misc.parseSendData(title, image, url);

                $.ajax("ENDPOINT FOR POSTING!!", { //TODO: CHANGE FOR PROD
                    type: 'POST',
                    data: data,
                    dataType: 'json',
                    headers: {
                        "ApiAuth": key
                    }
                }).finish(function (e) {
                    alert(e.toString());
                })
            }
        },
        //TODO possibly implement key in cookies/session
        cookie: {
            set: function (name, value) {
                let expires = "",
                    date = new Date();
                date.setTime(date.getTime() + (1 * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();

                document.cookie = name + "=" + (value || "") + expires + "; path=/";
            },
            get: function (name) {
                var nameEQ = name + "=";
                var ca = document.cookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
                }
                return null;
            },
            erase: function (name) {
                document.cookie = name + '=; Max-Age=-99999999;';
            }
        },
        misc: {
            getPath: function (e) {
                let elementParents = [];
                e.parents().addBack().not('html').each(function () {
                    let entry = this.tagName.toLowerCase();
                    if (this.className) {
                        entry += "." + this.className.trim().replace(/ /g, '.');
                    }
                    elementParents.push(entry);
                });
                return elementParents;
            },
            parseSendData: function (title, image, url) {
                let titlePath = Plugin.misc.getPath($(title.target)),
                    imagePath = Plugin.misc.getPath($(image.target)),
                    blockPath = [];

                try {
                    titlePath.forEach(function (entry, key) {
                        if (imagePath[key] !== entry) {
                            throw BreakException;
                        }
                        blockPath.push(entry);
                    });
                } catch (e) {
                    if (e !== BreakException) throw e;
                }

                let blockPathLast = blockPath[blockPath.length - 1];

                if (blockPathLast.split(".")[0] === 'a') {
                    blockPath.splice(-1, 1);
                    blockPathLast = blockPath[blockPath.length - 1];
                }

                titlePath = titlePath.filter((el) => !blockPath.includes(el));
                imagePath = imagePath.filter((el) => !blockPath.includes(el));
                let hrefPointer = $(blockPath.join(" ") + " " + imagePath.join(" ")).closest("a")[0],
                    hrefPath = Plugin.misc.getPath($(hrefPointer));
                hrefPath = hrefPath.filter((el) => !blockPath.includes(el));

                if (blockPathLast.split(".").length > 2) {
                    blockPathLast = blockPathLast.split(".");
                    blockPathLast.splice(-1, 1);
                    blockPathLast = blockPathLast.join(".");
                    blockPath[blockPath.length - 1] = blockPathLast;
                }

                if (blockPath.length > 4) {
                    blockPath.splice(0, blockPath.length - 4);
                }

                return {
                    block: Plugin.misc.removeNumClasses(blockPath).join(" "),
                    title: Plugin.misc.removeNumClasses(titlePath).join(" "),
                    image: Plugin.misc.removeNumClasses(imagePath).join(" "),
                    href: Plugin.misc.removeNumClasses(hrefPath).join(" "),
                    siteUrl: url
                };
            },
            removeNumClasses: function (array) {
                let newArray = [];
                array.forEach(function (element) {
                    let list = element.split("."),
                        newList = [];
                    list.forEach(function (el) {
                        let hasDigit = /(\d|first|last|third|middle|stock)/.test(el);
                        if (!hasDigit) {
                            newList.push(el);
                        }
                    });
                    newArray.push(newList.join("."));
                });
                return newArray;
            }
        }
    };