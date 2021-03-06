import React, { Component, Fragment } from 'react';
import { IoMdPerson, IoMdLock } from 'react-icons/io';
import { MdEmail } from 'react-icons/md';
import { connect } from 'react-redux';
import { loginUser, registerUser } from '../actions/authActions';
import LoginTextInput from './LoginTextInput';
import { Loader } from './Loader';

export class Login extends Component {
    state = {
        register: false,
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        city: ''
    };

    componentDidUpdate() {
        if (this.props.isAuthenticated) this.props.history.push('/');
    }

    onChangeFormType = type => {
        this.setState({ register: type === true });
    };

    onSubmit = e => {
        e.preventDefault();
        if (!this.state.register) this.props.loginUser(this.state.email, this.state.password);
        else
            this.props.registerUser({
                email: this.state.email,
                password: this.state.password,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                city: this.state.city
            });
    };

    onInputChange = e => {
        if (e.target) this.setState({ [e.target.name]: e.target.value });
    };

    render() {
        let btns = (
            <div className="login__btns">
                <button
                    type="button"
                    className="login__btn"
                    onClick={() => this.onChangeFormType(false)}
                >
                    Zaloguj się
                </button>
                <button
                    type="button"
                    className="login__btn login__btn--grey"
                    onClick={() => this.onChangeFormType(true)}
                >
                    Zarejestruj się
                </button>
            </div>
        );

        let title = 'Login';

        if (this.state.register) {
            btns = (
                <div className="login__btns">
                    <button
                        type="button"
                        className="login__btn  login__btn--grey"
                        onClick={() => this.onChangeFormType(false)}
                    >
                        Zaloguj się
                    </button>
                    <button
                        type="button"
                        className="login__btn"
                        onClick={() => this.onChangeFormType(true)}
                    >
                        Zarejestruj się
                    </button>
                </div>
            );
            title = 'Rejestracja';
        }

        let inputFields = (
            <Fragment>
                <LoginTextInput
                    type="text"
                    id="email"
                    placeholder="Email"
                    onChange={this.onInputChange}
                    label="Email:"
                    icon={<IoMdPerson className="login__icon" />}
                    required
                />
                <LoginTextInput
                    type="password"
                    id="password"
                    placeholder="Hasło"
                    onChange={this.onInputChange}
                    label="Hasło:"
                    icon={<IoMdLock className="login__icon" />}
                    required
                    classType="last"
                />
            </Fragment>
        );
        if (this.state.register) {
            inputFields = (
                <Fragment>
                    <LoginTextInput
                        type="text"
                        id="firstName"
                        placeholder="Imię"
                        onChange={this.onInputChange}
                        label="Imię:"
                        icon={<IoMdPerson className="login__icon" />}
                        required
                    />
                    <LoginTextInput
                        type="text"
                        id="lastName"
                        placeholder="Nazwisko"
                        onChange={this.onInputChange}
                        label="Nazwisko:"
                        icon={<IoMdPerson className="login__icon" />}
                        required
                    />
                    <LoginTextInput
                        type="text"
                        id="email"
                        placeholder="Email"
                        onChange={this.onInputChange}
                        label="Email:"
                        icon={<MdEmail className="login__icon" />}
                        required
                    />
                    <LoginTextInput
                        type="password"
                        id="password"
                        placeholder="Hasło"
                        onChange={this.onInputChange}
                        label="Hasło:"
                        icon={<IoMdLock className="login__icon" />}
                        required
                    />
                    <LoginTextInput
                        type="text"
                        id="city"
                        placeholder="Miejscowość"
                        onChange={this.onInputChange}
                        label="Miejscowość zamieszkania:"
                        icon={<MdEmail className="login__icon" />}
                        classType="last"
                    />
                </Fragment>
            );
        }
        let loading = (
            <div className="u-centered">
                <Loader />
            </div>
        );
        if (!this.props.isLoading)
            loading = this.props.errorMsg.length ? (
                <h3 className="login__msg">{this.props.errorMsg}</h3>
            ) : null;

        return (
            <form className="login" onSubmit={this.onSubmit}>
                {btns}
                <h2 className="login__title">{title}</h2>
                {inputFields}
                {loading}
                <button type="submit" className="btn btn--full">
                    Wyślij
                </button>

                {/* <div id="firebaseui-auth-container"></div> */}
            </form>
        );
    }
}

const mapStateToProps = state => ({
    isLoading: state.auth.isLoading,
    isAuthenticated: state.auth.isAuthenticated,
    errorMsg: state.error.msg
});

export default connect(mapStateToProps, { loginUser, registerUser })(Login);
