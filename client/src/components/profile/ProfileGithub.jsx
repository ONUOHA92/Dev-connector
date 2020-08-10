import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

class ProfileGithub extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clientId: 'abb234f58cdc69d4438a',
            clientSecret: '0e9a4e7a26d9726c20c455e79343ec10beec6a35',
            count: 5,
            sort: 'created: asc',
            repos: []
        }
    }

    componentDidMount() {

        const { username } = this.props
        const { count, sort, clientId, clientSecret } = this.state
        fetch(`https://api.github.com/users/${username}/repos?per_page=${count}&sort=${sort}&client_id=${clientId}
        &client_secret=${clientSecret}
        `)
            .then(res => res.json())
            .then(data => {
                if (this.refs.myRef) {
                    this.setState({ repos: data }); 
                }
            })
            .catch(err => console.log(err))
    }


    render() {
        const { repos } = this.state;

        const repoItems = repos.map(repo => (
            <div key={repo.id} className="card card-body mb-2">
                <div className="row">
                    <div className="col-md-6">
                        <h4>
                            <Link to={repo.html_url} className="text-info" target="_blank">
                                {repo.name}
                            </Link>
                        </h4>
                        <p>{repo.description}</p>
                    </div>
                    <div className="col-md-6">
                        <span className="badge badge-info mr-1">
                            star:{repo.stargazers_count}
                        </span>
                        <span className="badge badge-secondary mr-1">
                            watchers:{repo.watchers_count}
                        </span>
                        <span className="badge badge-success">
                            Forks:{repo.forks_count}
                        </span>
                    </div>
                </div>
            </div>
        ))
        return (
            <div ref="myRef">
                <hr />
                <h3 className="mb-4">Latest Github repos</h3>
                {repoItems}
            </div>
        );
    }
}

ProfileGithub.propTypes = {
    username: PropTypes.string.isRequired
}

export default ProfileGithub;