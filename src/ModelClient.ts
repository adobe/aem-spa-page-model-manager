/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { Model } from './Model';

export class ModelClient {
    private _apiHost: string | null;
    private _fetchPromises: { [key: string]: Promise<Model> } | null;

    /**
     * @constructor
     * @param [apiHost] Http host of the API.
     */
    constructor(apiHost?: string) {
        this._apiHost = apiHost || null;
        this._fetchPromises = {};
    }

    /**
     * Returns http host of the API.
     * @returns API host or `null`.
     */
    get apiHost(): string | null {
        return this._apiHost;
    }

    /**
     * Fetches a model using the given a resource path.
     * @param modelPath Absolute path to the model.
     * @return {*}
     */
    public fetch<M extends Model>(modelPath: string): Promise<M> {
        if (!modelPath) {
            const err = `Fetching model rejected for path: ${modelPath}`;
            return Promise.reject(new Error(err));
        }

        // Either the API host has been provided or we make an absolute request relative to the current host
        const apihostPrefix = this._apiHost || '';
        const url = `${apihostPrefix}${modelPath}`;

        // Assure that the default credentials value ('same-origin') is set for browsers which do not set it
        // or which are setting the old default value ('omit')
        return fetch(url, {credentials: 'same-origin'}).then((response) => {
            if ((response.status >= 200) && (response.status < 300)) {
                return response.json() as Promise<M>;
            }

            throw { response };
        }).catch((error) => {
            return Promise.reject(error);
        });
    }

    /**
     * Destroys the internal references to avoid memory leaks.
     */
    public destroy() {
        this._apiHost = null;
        this._fetchPromises = null;
    }
}
