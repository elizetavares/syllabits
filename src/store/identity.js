import jwt_decode from 'jwt-decode'
import { apolloClient } from '@/apollo'
import { Refresh } from '@/queries'

const PREEMPT = 60000;

let refreshTimeout = null;

export default {
    state() {
        return {
            // Token has three possible values, each of which correspond to a different state
            // Can be undefined, which means user's identity is YET to be determined (in an unknown state)
            // Can be null, which means user is not logged in/no identity
            // Can be an actual access token which corresponds to a user account (has an identity)
            token: undefined,
        }
    },
    mutations: {
        setToken(state, token) {
            state.token = token;
        },
    },
    getters: {
        claims(state) {
            if (state.token) return jwt_decode(state.token);
        },
        hasIdentity(state) {
            return Boolean(state.token);
        },
        isAdmin(state, getters) {
            return getters.claims?.is_admin;
        }
    },
    actions: {
        // Attempts to obtain a new access token by querying the server.
        // If our cookies contain an unexpired refresh token, this should succeed
        refreshIdentity({dispatch}) {
            return apolloClient.mutate({ mutation: Refresh })
                .then(result => result.data.refresh)
                .then(({result}) => dispatch('loadIdentity', result));
        },
        loadIdentity({commit, getters, dispatch}, token) {
            commit('setToken', token);
            // If token is valid, schedule token refresh
            // Make sure to cancel previously scheduled refresh if applicable
            if (token !== null) {
                const delta = (getters.claims.exp * 1000) - Date.now() - PREEMPT;
                if (refreshTimeout) clearTimeout(refreshTimeout);
                let callback = function() { dispatch('refreshIdentity') };
                refreshTimeout = setTimeout(callback, delta);
            }
        },
        clearIdentity({commit}) {
            commit('setToken', null);
            // Cancel refresh if applicable
            if (refreshTimeout) clearTimeout(refreshTimeout);
        },
    }
}