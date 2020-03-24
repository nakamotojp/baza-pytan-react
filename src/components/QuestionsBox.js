import React, { Component, Fragment } from 'react';
import Filrer from './Filter';
import Button from './Button';
import Questions from './Questions';
import { database, backendFunctions } from '../firebase';
import AddQestionCard from './AddQestionCard';
import { connect } from 'react-redux';
import {
    fetchPublicQuestions,
    fetchMyReviewQuestions,
    deleteQuestion,
    fetchAllReviewQuestions,
    createPublicQuestion,
    createReviewQuestion,
    updateQuestion
} from '../actions/questionActions';

export class QuestionsBox extends Component {
    defaultQuestionsPerPage = 4;

    state = {
        filterInput: [],
        addingQuestion: false,
        isFiltering: true,
        numOfQuestions: this.defaultQuestionsPerPage,
        type: 'public',
        editedPosition: null
    };

    componentDidMount() {
        this.loadQuestions(this.props.type);
        if (this.props.type) this.setState({ type: this.props.type });
        // DELETE THIS
    }

    componentDidUpdate() {
        console.log(this.props.questions);
        if (this.props.type !== this.state.type) {
            this.setState({ type: this.props.type, isFiltering: this.props.isFetching });
            this.loadQuestions(this.props.type);
            this.resetEditingQuestion();
        } else {
            if (this.state.isFiltering !== this.props.isFetching)
                this.setState({ isFiltering: this.props.isFetching });
        }
        console.log('QUESTIONS', this.props.questions);
    }

    loadQuestions = type => {
        switch (type) {
            case 'private':
                if (!this.props.user) {
                    this.props.history.push('/');
                    return;
                }
                if (this.props.user.uid) this.props.fetchMyReviewQuestions(this.props.user.uid);
                break;
            case 'review':
                if (!this.props.user || !this.props.isPublisher) {
                    this.props.history.push('/');
                    return;
                }
                this.props.fetchAllReviewQuestions();
                break;
            default:
                this.props.fetchPublicQuestions();
        }
        this.resetEditingQuestion();
        this.resetQuestionsNum();
    };

    onAddingQuestion = () => {
        this.setState({ addingQuestion: true });
    };

    onEndAddQuestion = () => {
        this.setState({ addingQuestion: false });
    };

    onAddedQuestion = (question, id = null) => {
        console.log('ADDDING', question, id, this.props.user);
        if (!this.props.user || !this.props.user.uid) return;
        if (this.state.type === 'private') {
            !id
                ? this.props.createReviewQuestion(question, this.props.user)
                : this.props.updateQuestion(id, 'reviewQuestions', question);
        } else if (this.state.type === 'review') {
            this.props.updateQuestion(id, 'reviewQuestions', question);
        } else {
            !id
                ? this.props.createPublicQuestion(question, this.props.user)
                : this.props.updateQuestion(id, 'publicQuestions', question);
        }
        this.onEndAddQuestion();
        this.resetEditingQuestion();
    };

    loadMoreQuestions = () => {
        const oldQuestionsNum = this.state.numOfQuestions;
        this.setState({ numOfQuestions: oldQuestionsNum + 3 });
    };

    resetQuestionsNum = () => {
        if (this.state.numOfQuestions !== this.defaultQuestionsPerPage)
            this.setState({ numOfQuestions: this.defaultQuestionsPerPage });
    };

    onFilterChange = input => {
        if (input.length && input[0].length > 1) {
            this.setState({ filterInput: input, isFiltering: true });
            return;
        }
        this.setState({ filterInput: input, isFiltering: false });
    };

    onDeleteQuestion = id => {
        switch (this.state.type) {
            case 'private':
                this.props.deleteQuestion(id, 'reviewQuestions');
                break;
            case 'review':
                if (!this.props.isPublisher) return;
                this.props.deleteQuestion(id, 'reviewQuestions');
                break;
            default:
                if (!this.props.isPublisher) return;
                this.props.deleteQuestion(id, 'publicQuestions');
        }
    };

    onEditedQuestion = id => {
        const position = this.props.questions.findIndex(el => el.id === id);
        this.setState({ editedPosition: position });
    };

    resetEditingQuestion = () => {
        this.setState({ editedPosition: null });
    };

    render() {
        let btns = (
            <Button
                onClick={this.loadMoreQuestions}
                className={
                    this.state.numOfQuestions >= this.props.questions.length ? 'btn--grey' : ''
                }
            >
                Załaduj więcej pytań
            </Button>
        );
        if ((this.props.isAdmin || this.state.type === 'private') && this.state.type !== 'review')
            btns = (
                <div className="questions-box__btns">
                    <Button onClick={this.onAddingQuestion}>Dodaj pytanie</Button>
                    <Button
                        onClick={this.loadMoreQuestions}
                        className={
                            this.state.numOfQuestions >= this.props.questions.length
                                ? 'btn--grey'
                                : ''
                        }
                    >
                        Załaduj więcej pytań
                    </Button>
                </div>
            );
        let questionsToRender = this.props.questions.filter(el => {
            if (this.state.filterInput.length === 0) return true;
            if (this.state.filterInput[0].length < 2) return true;
            this.resetQuestionsNum();
            let flag = false;
            if (el.keyWords && el.keyWords.forEach)
                el.keyWords.forEach(keyWord => {
                    this.state.filterInput.forEach(key => {
                        if (keyWord.toLowerCase().includes(key.toLowerCase()) && key.length > 1)
                            flag = true;
                    });
                });
            this.state.filterInput.forEach(key => {
                if (
                    el.question &&
                    el.question.toLowerCase().includes(key.toLowerCase()) &&
                    key.length > 1
                )
                    flag = true;
            });

            return flag;
        });
        if (questionsToRender && questionsToRender.length > this.state.numOfQuestions) {
            questionsToRender.splice(this.state.numOfQuestions);
        }
        let addQuestionCard = null;
        if (this.state.addingQuestion) {
            addQuestionCard = (
                <AddQestionCard onClose={this.onEndAddQuestion} onSubmit={this.onAddedQuestion} />
            );
        }
        let questionsRender = (
            <Questions
                questions={questionsToRender}
                onDeleteQuestion={this.onDeleteQuestion}
                onEditQuestion={this.onEditedQuestion}
                showLoader={this.state.isFiltering}
            />
        );
        if (this.state.editedPosition || this.state.editedPosition === 0) {
            questionsRender = (
                <Questions
                    questions={questionsToRender}
                    onDeleteQuestion={this.onDeleteQuestion}
                    onEditQuestion={this.onEditedQuestion}
                    showLoader={this.state.isFiltering}
                    editedPosition={this.state.editedPosition}
                    methods={{
                        onClose: this.resetEditingQuestion,
                        onSubmit: this.onAddedQuestion
                    }}
                />
            );
        }
        console.log(this.props.questions);
        console.log(questionsToRender);
        return (
            <Fragment>
                {/* <h1 className="heading-primary js--heading">Baza pytań</h1> */}
                <Filrer
                    placeholder="Szukaj pytań po słowach kluczowych..."
                    onChange={this.onFilterChange}
                />
                {questionsRender}
                {addQuestionCard}
                {btns}
            </Fragment>
        );
    }
}

const mapStateToProps = state => ({
    questions: state.questions.items,
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user,
    isPublisher: state.auth.isPublisher,
    isAdmin: state.auth.isAdmin,
    isFetching: state.questions.isFetching
});

export default connect(mapStateToProps, {
    fetchPublicQuestions,
    deleteQuestion,
    fetchMyReviewQuestions,
    fetchAllReviewQuestions,
    createPublicQuestion,
    createReviewQuestion,
    updateQuestion
})(QuestionsBox);
