import React, { Fragment, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import InboxMessage from "./InboxMessage";
import { Dropdown } from "react-bootstrap";
import PageTitle from "../../../../layouts/PageTitle";

const Inbox = () => {
  const Messages = [
    {
      text: "Ingredia Nutrisha, A collection of textile samples lay spread out on the table - Samsa was a travelling salesman - and above it there hung a picture",
      time: "11.49 am",
      icon: "fa fa-star",
    },
    {
      text: "Almost unorthographic life One day however a small line of blind text by the name of Lorem Ipsum decided to leave for the far World of Grammar.",
      time: "11.49 am",
      icon: "fa fa-star",
    },
    {
      text: "Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of",
      time: "11.49 am",
      icon: "fa fa-star",
    },
    {
      text: "Even the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of",
      time: "11.49 am",
      icon: "fa fa-star",
    },
    {
      text: "Ingredia Nutrisha, A collection of textile samples lay spread out on the table - Samsa was a travelling salesman - and above it there hung a picture",
      time: "11.49 am",
      icon: "fa fa-star",
    },
    {
      text: "Almost unorthographic life One day however a small line of blind text by the name of Lorem Ipsum decided to leave for the far World of Grammar.",
      time: "11.49 am",
      icon: "fa fa-star",
    },
    {
      text: "Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of",
      time: "11.49 am",
      icon: "fa fa-star",
    },
    {
      text: "Even the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of",
      time: "11.49 am",
      icon: "fa fa-star",
    },
    {
      text: "Ingredia Nutrisha, A collection of textile samples lay spread out on the table - Samsa was a travelling salesman - and above it there hung a picture",
      time: "11.49 am",
      icon: "fa fa-star",
    },
    {
      text: "Almost unorthographic life One day however a small line of blind text by the name of Lorem Ipsum decided to leave for the far World of Grammar.",
      time: "11.49 am",
      icon: "fa fa-star",
    },
    {
      text: "Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of",
      time: "11.49 am",
      icon: "fa fa-star",
    },
    {
      text: "Even the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of",
      time: "11.49 am",
      icon: "fa fa-star",
    },
    {
      text: "Ingredia Nutrisha, A collection of textile samples lay spread out on the table - Samsa was a travelling salesman - and above it there hung a picture",
      time: "11.49 am",
      icon: "fa fa-star",
    },
    {
      text: "Almost unorthographic life One day however a small line of blind text by the name of Lorem Ipsum decided to leave for the far World of Grammar.",
      time: "11.49 am",
      icon: "fa fa-star",
    },
    {
      text: "Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of",
      time: "11.49 am",
      icon: "fa fa-star",
    },
    {
      text: "Even the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of",
      time: "11.49 am",
      icon: "fa fa-star",
    },
    {
      text: "Ingredia Nutrisha, A collection of textile samples lay spread out on the table - Samsa was a travelling salesman - and above it there hung a picture",
      time: "11.49 am",
      icon: "fa fa-star",
    },
    {
      text: "Almost unorthographic life One day however a small line of blind text by the name of Lorem Ipsum decided to leave for the far World of Grammar.",
      time: "11.49 am",
      icon: "fa fa-star",
    },
    {
      text: "Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of",
      time: "11.49 am",
      icon: "fa fa-star",
    },
    {
      text: "Even the all-powerful Pointing has no control about the blind texts it is an almost unorthographic life One day however a small line of blind text by the name of",
      time: "11.49 am",
      icon: "fa fa-star",
    },
  ];

  const [data, setData] = useState(
    document.querySelectorAll(".email-right-box .email-list .message")
  );
  const sort = 10;
  const activePag = useRef(0);
  const [test, settest] = useState(0);

  // Active data
  const chageData = (frist, sec) => {
    for (var i = 0; i < data.length; ++i) {
      if (i >= frist && i < sec) {
        data[i].classList.remove("d-none");
      } else {
        data[i].classList.add("d-none");
      }
    }
  };
  // use effect
  useEffect(() => {
    setData(document.querySelectorAll(".email-right-box .email-list .message"));
    //chackboxFun();
  }, [test]);
  // Active pagginarion
  activePag.current === 0 && chageData(0, sort);
  // paggination
  let paggination = Array(Math.ceil(data.length / sort))
    .fill()
    .map((_, i) => i + 1);

  // Active paggination & chage data
  const onClick = (i) => {
    activePag.current = i;
    chageData(activePag.current * sort, (activePag.current + 1) * sort);
    settest(i);
  };
  const chackbox = document.querySelectorAll(".message input");
  const motherChackBox = document.querySelector("#checkbox1");
  const chackboxFun = (type) => {
    for (let i = 0; i < chackbox.length; i++) {
      const element = chackbox[i];
      if (type === "all") {
        if (motherChackBox.checked) {
          element.checked = true;
        } else {
          element.checked = false;
        }
      } else {
        if (!element.checked) {
          motherChackBox.checked = false;
          break;
        } else {
          motherChackBox.checked = true;
        }
      }
    }
  };
  return (
    <Fragment>
      <PageTitle activeMenu="Inbox" motherMenu="Email" />

      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-lg-3">
                  <div className="email-left-box">
                    <div className="p-0">
                      <Link
                        to="/email-compose"
                        className="btn btn-primary btn-block"
                      >
                        Compose
                      </Link>
                    </div>
                    <div className="mail-list rounded mt-4">
                      <Link
                        to="/email-inbox"
                        className="list-group-item active"
                      >
                        <i className="fa fa-inbox font-18 align-middle me-2"></i>{" "}
                        Inbox
                        <span className="badge badge-primary badge-sm float-end">
                          198
                        </span>
                      </Link>
                      <Link to="/email-inbox" className="list-group-item">
                        <i className="fa fa-paper-plane font-18 align-middle me-2"></i>
                        Sent
                      </Link>
                      <Link to="/email-inbox" className="list-group-item">
                        <i className="fa fa-star font-18 align-middle me-2"></i>
                        Important
                        <span className="badge badge-danger text-white badge-sm float-end">
                          47
                        </span>
                      </Link>
                      <Link to="/email-inbox" className="list-group-item">
                        <i className="mdi mdi-file-document-box font-18 align-middle me-2"></i>
                        Draft
                      </Link>
                      <Link to="/email-inbox" className="list-group-item">
                        <i className="fa fa-trash font-18 align-middle me-2"></i>
                        Trash
                      </Link>
                    </div>
                    <div className="mail-list rounded overflow-hidden mt-4 ">
                      <div className="intro-title d-flex justify-content-between my-0">
                        <h5>Categories</h5>
                        <i className="fa fa-chevron-down"></i>
                      </div>
                      <Link to="/email-inbox" className="list-group-item">
                        <span className="icon-warning">
                          <i className="fa fa-circle"></i>
                        </span>{" "}
                        Work
                      </Link>
                      <Link to="/email-inbox" className="list-group-item">
                        <span className="icon-primary">
                          <i className="fa fa-circle"></i>
                        </span>{" "}
                        Private
                      </Link>
                      <Link to="/email-inbox" className="list-group-item">
                        <span className="icon-success">
                          <i className="fa fa-circle"></i>
                        </span>{" "}
                        Support
                      </Link>
                      <Link to="/email-inbox" className="list-group-item">
                        <span className="icon-dpink">
                          <i className="fa fa-circle"></i>
                        </span>{" "}
                        Social
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="col-lg-9">
                  <div className="email-right-box">
                    <div className="toolbar mb-4" role="toolbar">
                      <div className="btn-group mb-1">
                        <button
                          type="button"
                          className="btn btn-primary light px-3"
                        >
                          <i className="fa fa-archive"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary light px-3"
                        >
                          <i className="fa fa-exclamation-circle"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary light px-3"
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </div>
                      <Dropdown className="btn-group mb-1">
                        <Dropdown.Toggle type="button" className="btn btn-primary light dropdown-toggle px-3 ms-1">
                          <i className="fa fa-folder me-1"></i>
                          <b className="caret m-l-5"></b>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="dropdown-menu">
                          <Dropdown.Item as="a" className="dropdown-item" to="/email-compose">
                            Social
                          </Dropdown.Item>
                          <Dropdown.Item as="a" className="dropdown-item" to="/email-compose">
                            Promotions
                          </Dropdown.Item>
                          <Dropdown.Item as="a" className="dropdown-item" to="/email-compose">
                            Updates
                          </Dropdown.Item>
                          <Dropdown.Item
                            as="a"
                            className="dropdown-item"
                            to="/email-compose"
                          >
                            Forums
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                      <Dropdown className="btn-group mb-1">
                        <Dropdown.Toggle
                          className="btn btn-primary light dropdown-toggle px-3 ms-1"
                          data-toggle="dropdown"
                        >
                          <i className="fa fa-tag me-1"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item as="a">Updates</Dropdown.Item>
                          <Dropdown.Item as="a">Social</Dropdown.Item>
                          <Dropdown.Item as="a">Promotions</Dropdown.Item>
                          <Dropdown.Item as="a">Forums</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                      <Dropdown className="btn-group mb-1">
                        <Dropdown.Toggle
                          type="button"
                          className="btn btn-primary light dropdown-toggle  ms-1"
                          data-toggle="dropdown"
                        >
                          More <span className="caret m-l-5"></span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="dropdown-menu">
                          <Dropdown.Item
                            className="dropdown-item"
                            to="/email-compose"
                          >
                            Mark as Unread
                          </Dropdown.Item>
                          <Dropdown.Item
                            className="dropdown-item"
                            to="/email-compose"
                          >
                            Add to Tasks
                          </Dropdown.Item>
                          <Dropdown.Item
                            className="dropdown-item"
                            to="/email-compose"
                          >
                            Add Star
                          </Dropdown.Item>
                          <Dropdown.Item
                            className="dropdown-item"
                            to="/email-compose"
                          >
                            Mute
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                      <div className="btn-group mb-1"></div>
                      <div className="btn-group mb-1"></div>
                      <div className="btn-group mb-1"></div>
                    </div>
                    <div className="email-list mt-3 dz-scroll" id="mail-list">
                      {/** Single Message */}
                      {Messages.map((message, index) => (
                        <InboxMessage
                          key={index}
                          id={index}
                          message={message}
                        ></InboxMessage>
                      ))}
                    </div>
                    <div className="row mt-4">
                      <div className="col-12 ps-3">
                        <nav>
                          <ul className="pagination pagination-gutter pagination-primary pagination-sm no-bg">
                            <li className="page-item page-indicator">
                              <Link
                                className="page-link"
                                to="/email-inbox"
                                onClick={() =>
                                  activePag.current > 0 &&
                                  onClick(activePag.current - 1)
                                }
                              >
                                <i className="la la-angle-left"></i>
                              </Link>
                            </li>
                            {paggination.map((number, i) => (
                              <li
                                key={i}
                                className={`page-item  ${
                                  activePag.current === i ? "active" : ""
                                } `}
                                onClick={() => onClick(i)}
                              >
                                <Link className="page-link" to="/email-inbox">
                                  {number}
                                </Link>
                              </li>
                            ))}

                            <li className="page-item page-indicator">
                              <Link
                                className="page-link"
                                to="/email-inbox"
                                onClick={() =>
                                  activePag.current + 1 < paggination.length &&
                                  onClick(activePag.current + 1)
                                }
                              >
                                <i className="la la-angle-right"></i>
                              </Link>
                            </li>
                        </ul>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Inbox;
