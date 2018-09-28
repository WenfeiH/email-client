import React, { Component } from "react";
import axios from "axios";
import "./hw8.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emails: [],
      chosenFolder: "inbox",
      detail: {}
    };
  }

  componentDidMount() {
    axios
      .get("http://api.haochuan.io/emails")
      .then(res => {
        this.setState({
          emails: res.data.emailData.map((item, index) => {
            return { id: index, ...item };
          })
        });
      })
      .catch(err => console.log(err));
  }
  unreadCount = folder => {
    return this.state.emails.filter(
      item => item.read === "false" && item.tag === folder
    ).length;
  };
  folderChosen = folder => {
    this.setState({ chosenFolder: folder });
  };

  readEmail = id => {
    let arr = this.state.emails;
    let index = arr.findIndex(item => item.id === id);
    if (arr[index].read === "false") {
      arr[index].read = "true";
    }
    this.setState({ detail: { ...arr[index] } });
  };

  deleteEmail = id => {
    let arr = this.state.emails;
    let index = arr.findIndex(item => item.id === id);
    let ss = arr.findIndex(item => item.id > id && item.tag === arr[index].tag);

    //这里我要当要删除的email是folder中的最后一个时候（不再有id比这条大的了，ss是-1），删除之后显示倒数它前一条email，也就是id比它小的最后一条
    //很笨拙，先把email arr反转，然后找到反转后的第一个满足条件的，最后通过长度减去这个index得到在原来arr里面的位置
    //有什么好方法么
    //并且还有个问题，将arr reverse之后还要reverse回来，this.state.email里面顺序才不会改变
    if (ss === -1) {
      // console.log(this.state.emails);
      // console.log(arr);
      ss = arr
        .reverse()
        .findIndex(item => item.id < id && item.tag === arr[index].tag); //为什么这里reverse了arr会影响到原来的email顺序呢，还需要reverse回来才行，不是只能通过setState修改么
      // console.log(this.state.emails);
      // console.log(arr);
      arr.reverse();
      ss = arr.length - 1 - ss;
    }
    console.log("read", ss);
    this.readEmail(ss);

    //这里我想要在得到删除一条email之后它的下一条email的id，然后call readEmail去读取下一条的信息
    //我实现了，但是我不太清楚期间的运行关系
    //在readEmail后有state更新，那么便会立刻重新render，那接下来这两句也照样执行？然后再render？看结果是这样的
    // arr[index].tag = "deleted";
    this.setState({
      emails: [
        ...this.state.emails.slice(0, index),
        {
          ...this.state.emails[index],
          tag: "deleted"
        },
        ...this.state.emails.slice(index + 1)
      ]
    });
  };

  render() {
    return (
      <div>
        <div className="left">
          <Folder
            folderName="inbox"
            folderHandler={this.folderChosen}
            unreadCount={this.unreadCount("inbox")}
            chosenFolder={
              this.state.chosenFolder //这个立即执行就行了，onclick才需要()=>
            }
          />
          <Folder
            folderName="send"
            folderHandler={this.folderChosen}
            unreadCount={this.unreadCount("send")}
            chosenFolder={this.state.chosenFolder}
          />
          <Folder
            folderName="draft"
            folderHandler={this.folderChosen}
            unreadCount={this.unreadCount("draft")}
            chosenFolder={this.state.chosenFolder}
          />
          <Folder
            folderName="deleted"
            folderHandler={this.folderChosen}
            unreadCount={this.unreadCount("deleted")}
            chosenFolder={this.state.chosenFolder}
          />
        </div>

        {this.state.chosenFolder === "inbox" && (
          <EmailList
            emails={this.state.emails}
            folder="inbox"
            readHandler={this.readEmail}
            deleteHandler={this.deleteEmail}
            detail={this.state.detail}
            chosenFolder={this.state.chosenFolder}
          />
        )}
        {this.state.chosenFolder === "send" && (
          <EmailList
            emails={this.state.emails}
            folder="send"
            readHandler={this.readEmail}
            deleteHandler={this.deleteEmail}
            detail={this.state.detail}
            chosenFolder={this.state.chosenFolder}
          />
        )}
        {this.state.chosenFolder === "draft" && (
          <EmailList
            emails={this.state.emails}
            folder="draft"
            readHandler={this.readEmail}
            deleteHandler={this.deleteEmail}
            detail={this.state.detail}
            chosenFolder={this.state.chosenFolder}
          />
        )}
        {this.state.chosenFolder === "deleted" && (
          <EmailList
            emails={this.state.emails}
            folder="deleted"
            readHandler={this.readEmail}
            deleteHandler={this.deleteEmail}
            detail={this.state.detail}
            chosenFolder={this.state.chosenFolder}
          />
        )}
      </div>
    );
  }
}

const Folder = props => {
  return (
    <div
      className={
        props.chosenFolder === props.folderName
          ? "category cate-chosen"
          : "category"
      }
      onClick={() => props.folderHandler(props.folderName)}
    >
      <p>
        {props.folderName} {props.unreadCount}
      </p>
    </div>
  );
};

const EmailList = props => {
  let emailShow = props.emails.filter(email => email.tag === props.folder);
  return (
    <div className="right">
      {emailShow.length === 0 ? (
        <div className="middle-column">The folder is empty</div>
      ) : (
        <div className="middle-column">
          {emailShow.map(email => {
            return (
              <Email
                {...email}
                readHandler={props.readHandler}
                readId={props.detail.id}
                key={email.id}
              />
            );
          })}
        </div>
      )}
      <Detail
        {...props.detail}
        deleteHandler={props.deleteHandler}
        chosenFolder={props.chosenFolder}
      />
    </div>
  );
};

const Email = props => {
  return (
    <div
      className={props.id === props.readId ? "item item-chosen" : "item"}
      onClick={() => {
        props.readHandler(props.id);
      }}
    >
      <p>{props.id}</p>
      <p>{props.subject}</p>
      <p>{props.from}</p>
      <p>{props.time}</p>
      <p>{props.read}</p>
    </div>
  );
};

const Detail = props => {
  return props.chosenFolder === props.tag ? (
    <div className="right-column">
      <p>{props.subject}</p>
      <p>{props.from}</p>
      <p>{props.time}</p>
      {props.tag === "deleted" || !props.subject ? null : (
        <button onClick={() => props.deleteHandler(props.id)}>Delete</button>
      )}
      <p>{props.message}</p>
    </div>
  ) : null;
};

export default App;
