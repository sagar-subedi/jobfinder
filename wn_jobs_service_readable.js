'use strict';

angular.module('WnJobs.services', []).factory('JobsService', function ($http) {
    var jobsAPI = {};
    var root_url = elasticRootUrl;
    var main_url = root_url + '/' + elasticIndex + '/_search';
    var preview_url = root_url + '/api/preview-index/_search';

    function escapeSpecialChars(input) {
        return input
            .replace(/\\/g, '\\\\')  // Escape backslashes
            .replace(/"/g, '\\"');   // Escape double quotes
    }

    function getQueryString(tags){
        var data_query = '';
        for (var i = 0; i < tags.length; i++) {
            if (!tags[i].startsWith('title:')) {
                if (data_query.length > 0) {
                    data_query += " OR "
                }

                if (tags[i].includes('AND')) {
                    let parts = tags[i].split(/\s+AND\s+/i);
                    data_query += '(' + parts.map(part => '"' + escapeSpecialChars(part.trim()) + '"').join(' AND ') + ')';
                }
                else {
                    data_query += '"' + escapeSpecialChars(tags[i].trim()) + '"';
                }
            }
        }
        return data_query;
    }

    function getQueryTitle(tags){
        var data_query = '';

        for (var i = 0; i < tags.length; i++) {
            if (tags[i].startsWith('title:')) {
                if (data_query.length > 0) {
                    data_query += " OR "
                }
                data_query += '"' + escapeSpecialChars(tags[i].substring(6).toLowerCase()) + '"';
            }
        }
        return data_query;
    }

    function getCategoryFilter(categories) {
        var category_filter = []

        for (var i = 0; i < categories.length; i++) {
            if (categories[i].checked) {
                category_filter.push(categories[i].key);
            }
        }

        return {terms: {"category_name.raw": category_filter}};
    }

    function getPositionTypeFilter(positionTypes) {
        var position_type_filter = []

        for (var i = 0; i < positionTypes.length; i++) {
            if (positionTypes[i].checked) {
                position_type_filter.push(positionTypes[i].query);
            }
        }

        return {terms: {"position_type": position_type_filter}};
    }

    function getSalaryFromFilter(salaryFrom) {
        return {
            range: {
                "annual_salary_usd": {
                    "gte": salaryFrom
                }
            }
        };
    }

    function getSalaryToFilter(salaryTo) {
        return {
            range: {
                "annual_salary_usd": {
                    "lte": salaryTo
                }
            }
        };
    }

    function getPostedDateFilter(postedDates) {
        let dateFilter = {};

        for (let i = 0; i < postedDates.length; i++) {
            if (postedDates[i].checked) {
                switch (postedDates[i].key) {
                    case "1":  // Today
                        dateFilter = {
                            range: {
                                pub_date: {
                                    gte: "now-1d/d",
                                }
                            }
                        };
                        break;
                    case "3":  // Last 3 Days
                        dateFilter = {
                            range: {
                                pub_date: {
                                    gte: "now-3d/d",
                                }
                            }
                        };
                        break;
                    case "7":  // Last 7 Days
                        dateFilter = {
                            range: {
                                pub_date: {
                                    gte: "now-7d/d",
                                }
                            }
                        };
                        break;
                    default:
                        break;
                }
                break;  // Exit loop once a checked item is found
            }
        }

        return dateFilter;
    }

    function getLocationFilter(locations, strictLocation) {
        var location_filter = []

        if(strictLocation){
            var locationsToBeIncluded = new Set(locations.filter((loc) => loc.checked).map((loc) => loc.query_strict).flat(1));
        }
        else {
            var locationsToBeIncluded = new Set(locations.filter((loc) => loc.checked).map((loc) => loc.query).flat(1));
        }

        for (const loc of locationsToBeIncluded) {
            location_filter.push(loc);
        }

        return {terms: {"locations": location_filter}};
    }


    function getData(page, query, positionTypes, locations, categories, tags, fullLoad, initLoad, noDescription, strictLocation, postedDates, salaryFrom, salaryTo, sort){
        if (tags === undefined)
            tags = [];

        if (fullLoad === undefined)
            fullLoad = false;

        if (initLoad === undefined)
            initLoad = false;

        if (noDescription === undefined)
            noDescription = false;

        var size = 50;
        var from = (page - 1) * 50;
        if (fullLoad) {
            size = page * 50;
            from = 0;
        }

        if (initLoad) {
            size = 100
            from = 0;
        }

        var data = {
            track_total_hits: true,
            from: from,
            size: size,
            _source: ['company', 'company_slug', 'category_name', 'locations', 'location_base', 'salary_range', 'salary_range_short', 'number_of_applicants', 'instructions', 'id', 'external_id',
                'slug', 'title', 'pub_date', 'tags', 'source', 'apply_option', 'apply_email', 'apply_url', 'premium', 'expired', 'use_ats', 'position_type', 'annual_salary_usd']
        };

        if (premiumSubscription === 'True') {
            if (sort === 'relevance'){ data.sort = [{_score:{order: 'desc'}}, {pub_date:{order: 'desc'}}];}
            else { data.sort = [{pub_date: {order: 'desc'}}];}
        }
        else{
            if (sort === 'relevance'){ data.sort = [{premium:{order: 'desc'}}, {_score: {order: 'desc'}}, {pub_date:{order: 'desc'}}];}
            else { data.sort = [{premium:{order: 'desc'}}, {pub_date:{order: 'desc'}}];}
        }

        if (!noDescription) {
            data._source.push('description');
        }

        if (tags.length > 0){
            let queries = [];

            if (tags.filter(tag => !tag.startsWith('title:')).length > 0){
                queries.push({
                    query_string: {
                        query: getQueryString(tags),
                        fields: ['title^2', 'description', 'company']
                    }
                });
            }

            if (tags.filter(tag => tag.startsWith('title:')).length > 0){
                queries.push({
                    query_string: {
                        query: getQueryTitle(tags),
                        fields: ['title^2']
                    }
                });
                data.query = {
                    bool: {
                        should: queries
                    }
                };
            }
            else {
                data.query = {
                    bool: {
                        must: queries[0]
                    }
                };
            }
            data.min_score = 2;
        }

        if (categories.some(obj => obj.checked === true)) {
            if (!data.hasOwnProperty('query')) {
                data.query = {bool: {filter: []}};
            }
            if (!data.query.bool.hasOwnProperty('filter')) {
                data.query.bool.filter = [];
            }

            data.query.bool.filter.push(getCategoryFilter(categories));
        }

        if (positionTypes.some(obj => obj.checked === true)) {
            if (!data.hasOwnProperty('query')){
                data.query = {bool: {filter: []}};
            }
            if (!data.query.bool.hasOwnProperty('filter')) {
                data.query.bool.filter = [];
            }

            data.query.bool.filter.push(getPositionTypeFilter(positionTypes));
        }

        if (locations.some(obj => obj.checked === true)) {
            if (!data.hasOwnProperty('query')){
                data.query = {bool: {filter: []}};
            }
            if (!data.query.bool.hasOwnProperty('filter')) {
                data.query.bool.filter = [];
            }

            data.query.bool.filter.push(getLocationFilter(locations, strictLocation));
        }

        if (postedDates.some(obj => obj.checked === true && obj.key !== 'any')) {
            if (!data.hasOwnProperty('query')){
                data.query = {bool: {filter: []}};
            }
            if (!data.query.bool.hasOwnProperty('filter')) {
                data.query.bool.filter = [];
            }

            data.query.bool.filter.push(getPostedDateFilter(postedDates));
        }


        if (salaryFrom > 0) {
            if (!data.hasOwnProperty('query')){
                data.query = {bool: {filter: []}};
            }
            if (!data.query.bool.hasOwnProperty('filter')) {
                data.query.bool.filter = [];
            }

            data.query.bool.filter.push(getSalaryFromFilter(salaryFrom));
        }

        if (salaryTo > 0) {
            if (!data.hasOwnProperty('query')){
                data.query = {bool: {filter: []}};
            }
            if (!data.query.bool.hasOwnProperty('filter')) {
                data.query.bool.filter = [];
            }

            data.query.bool.filter.push(getSalaryToFilter(salaryTo));
        }

        return data;
    }

    jobsAPI.getJobs = function (page, query, positionTypes, locations, categories, tags, strictLocation, sort, postedDates, salaryFrom, salaryTo, fullLoad, initLoad, noDescription) {
        return $http({
            method: 'POST',
            url: main_url,
            data: getData(page, query, positionTypes, locations, categories, tags, fullLoad, initLoad, noDescription, strictLocation, postedDates, salaryFrom, salaryTo, sort)
        });
    }

    jobsAPI.getPreview = function (page, query, positionTypes, locations, categories, tags, strictLocation, postedDates, salaryFrom, salaryTo, fullLoad, initLoad, noDescription) {
        return $http({
            method: 'POST',
            url: preview_url,
            data: getData(page, query, positionTypes, locations, categories, tags, fullLoad, initLoad, noDescription, strictLocation, postedDates, salaryFrom, salaryTo)
        });
    }


        // Function to get the CSRF token from the cookie
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

    jobsAPI.getCategories = function () {
        if(premiumSubscription === 'True') {
            return $http({
                method: 'POST',
                url: main_url,
                data: {
                    "size": 0,
                    "aggs": {
                        "category_name.raw": {
                            "terms": {
                                "field": "category_name.raw",
                                "size": 50
                            }
                        }
                    }
                },
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });
        } else {
            return $http({
                method: 'POST',
                url: main_url,
                data: {
                    "size": 0,
                    "aggs": {
                        "category_name.raw": {
                            "terms": {
                                "field": "category_name.raw",
                                "size": 50
                            }
                        }
                    }
                }
            });
        }
    }

    jobsAPI.getJob = function (id) {
        var url = main_url + "/" + id;

        return $http({
            method: 'GET',
            url: url
        });
    }

    jobsAPI.getJobBySlug = function (slug) {
        var url = main_url + "/?q=slug:" + slug;

        return $http({
            method: 'GET',
            url: url
        });
    }

    return jobsAPI;
}).factory('JobsDBService', ($http, $uibModal) => ({
    getJob: function (id) {
        return $http.get('/jobs/{id}.json'.replace('{id}', id));
    },
    getUserJobs: function () {
        return $http.get('/api/user-jobs/');
    },
    bookmark: function (jobId) {
        return $http.post('/api/favorite-jobs/', {job: jobId});
    },
    setSeenJob: function (jobId) {
        return $http.post('/api/user-jobs/', {job_type: "seen_jobs", job_id: jobId});
    },

    getJ2cDetail: function (jobId) {
        return $http.get('/api/j2c-detail?jobid=' + jobId);
    }
}));
