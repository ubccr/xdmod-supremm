db = db.getSiblingDB("auth");

db.createUser({
    user: "admin",
    pwd: "QQtggS+mU4d50+hT7GzfM",
    roles: [{
        role: "userAdminAnyDatabase",
        db: "admin"
    }]
});

db.createUser({
    user: "xdmod",
    pwd: "uvVA6bIC9DMts30ZiLRaH",
    roles: [{
        role: "readWrite",
        db: "supremm"
    }]
});
