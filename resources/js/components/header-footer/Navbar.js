import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./css/navbar.scss";
import Http from "../../Http";
import { connect } from "react-redux";

class Navbar extends Component {
    constructor(props) {
        super(props);
        this.logoutAccount = this.logoutAccount.bind(this);
        this.isLoggedIn = this.isLoggedIn.bind(this);
    }

    componentDidMount() {
        this.isLoggedIn();
    }

    isLoggedIn() {
        if (localStorage.getItem("auth_token")) {
            Http.defaults.headers.common["Authorization"] =
                "Bearer " + localStorage["auth_token"];
            Http.get("http://localhost:8000/api/user/isLoggedIn")
                .then(response => {
                    if (response.data.user) {
                        var currentUser = {
                            id: response.data.user.id,
                            name: response.data.user.name
                        };
                        this.props.login(currentUser);
                    }
                })
                .catch(error => {
                    console.log(error.response.status);
                });
        } else {
            console.log("k có auth_token trong Local Storage");
        }
    }

    logoutAccount() {
        this.props.logout();
        localStorage.removeItem("auth_token");
    }

    render() {
        return (
            <div className="navbar-section">
                <header className="top-black-style d-flex justify-content-center align-items-center">
                    <nav className="d-flex justify-content-between align-items-center">
                        <Link to="/">
                            <img
                                src="https://res.cloudinary.com/dbzfjnlhl/image/upload/v1613919232/27b6792e-38bd-471c-b46e-177a0e5a1af0_200x200_lb4mcd.png"
                                alt="logo"
                            />
                        </Link>
                        <div className="login-logout">
                            {this.props.currentUser ? (
                                <div>
                                    <div className="special">
                                        Hello {this.props.currentUser.name}
                                    </div>
                                    <div
                                        className="special"
                                        onClick={this.logoutAccount}
                                    >
                                        LOGOUT
                                    </div>
                                </div>
                            ) : (
                                <div className="special">
                                    <Link to="/login">LOGIN</Link>
                                </div>
                            )}
                        </div>
                    </nav>
                </header>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        currentUser: state.auth.currentUser
    };
};

const mapDispatchToProps = dispatch => {
    return {
        logout: () => {
            dispatch({
                type: "LOGOUT"
            });
        },
        login: username => {
            dispatch({
                type: "LOGIN",
                payload: username
            });
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
