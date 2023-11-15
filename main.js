const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const Realm = require("realm");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "./preload.js"),
    },
  });

  win.webContents.openDevTools();

  win.loadFile("./index.html");
}
class User extends Realm.Object {
  static schema = {
    name: "users",
    primaryKey: "_id",
    properties: {
      _id: { type: "objectId", default: () => new Realm.BSON.ObjectId() },
      name: "string",
      age: "int",
    },
  };
}
app.whenReady().then(async () => {
  let realm;
  let users;
  try {
    const app = new Realm.App({ id: "application-0-fmyxd" });
    const credentials = Realm.Credentials.anonymous();
    const user = await app.logIn(credentials);
    realm = await Realm.open({
      schema: [User],
      sync: { user, flexible: true },
    });
    await realm.subscriptions.update((subs) => {
      users = realm.objects(User);
      subs.add(users);
    });

    const usr = realm.objects(User);
    const collection = usr.subscribe();
    (await collection).addListener((collection, change) => {
      console.log({ collection });
    });

    function realmChangefunc() {
      const usersCollection = realm.objects(User);
      // This callback will be called whenever the users collection changes
      // Update your UI or perform any necessary actions here
      const updatedUsers = usersCollection.toJSON();
      //   ipcMain.emit("recieve-response", updatedUsers);
      console.log("Updated Users:", updatedUsers);
    }

    realm.addListener("change", realmChangefunc);

    realm.syncSession.addProgressNotification(
      "upload",
      "change",
      (progress) => {
        console.log("Sync Progress:", progress);
      }
    );
  } catch (error) {
    console.log(error);
  }
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  ipcMain.on("some-message", async (event, data) => {
    // Do something with the data
    console.log({ data });
    // Send a response back to the renderer process if needed
    const users = await realm.write(() => {
      return realm.create(User, { name: data.name, age: Number(data.age) });
    });
    const userDate = await realm.objects(User);
    event.sender.send("recieve-response", userDate.toJSON());
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
