[{
    "name": "Match IP Interface",
    "class": "org.opennms.netmgt.provision.persist.policies.MatchingIpInterfacePolicy",
    "parameters": [{
        "key": "matchBehavior",
        "required": true,
        "options": ["ALL_PARAMETERS", "ANY_PARAMETER", "NO_PARAMETERS"]
    }, {
        "key": "action",
        "required": true,
        "options": ["DISABLE_COLLECTION", "DISABLE_SNMP_POLL", "DO_NOT_PERSIST", "ENABLE_COLLECTION", "ENABLE_SNMP_POLL", "MANAGE", "UNMANAGE"]
    }, {
        "key": "hostName",
        "required": false,
        "options": []
    }, {
        "key": "ipAddress",
        "required": false,
        "options": []
    }]
}, {
    "name": "Match SNMP Interface",
    "class": "org.opennms.netmgt.provision.persist.policies.MatchingSnmpInterfacePolicy",
    "parameters": [{
        "key": "matchBehavior",
        "required": true,
        "options": ["ALL_PARAMETERS", "ANY_PARAMETER", "NO_PARAMETERS"]
    }, {
        "key": "action",
        "required": true,
        "options": ["DISABLE_COLLECTION", "DISABLE_POLLING", "DO_NOT_PERSIST", "ENABLE_COLLECTION", "ENABLE_POLLING"]
    }, {
        "key": "ifAdminStatus",
        "required": false,
        "options": []
    }, {
        "key": "ifAlias",
        "required": false,
        "options": []
    }, {
        "key": "ifDescr",
        "required": false,
        "options": []
    }, {
        "key": "ifIndex",
        "required": false,
        "options": []
    }, {
        "key": "ifName",
        "required": false,
        "options": []
    }, {
        "key": "ifOperStatus",
        "required": false,
        "options": []
    }, {
        "key": "ifSpeed",
        "required": false,
        "options": []
    }, {
        "key": "ifType",
        "required": false,
        "options": []
    }, {
        "key": "physAddr",
        "required": false,
        "options": []
    }]
}, {
    "name": "Set Node Category",
    "class": "org.opennms.netmgt.provision.persist.policies.NodeCategorySettingPolicy",
    "parameters": [{
        "key": "category",
        "required": true,
        "options": []
    }, {
        "key": "matchBehavior",
        "required": true,
        "options": ["ALL_PARAMETERS", "ANY_PARAMETER", "NO_PARAMETERS"]
    }, {
        "key": "foreignSource",
        "required": false,
        "options": []
    }, {
        "key": "foreignId",
        "required": false,
        "options": []
    }, {
        "key": "label",
        "required": false,
        "options": []
    }, {
        "key": "netBiosDomain",
        "required": false,
        "options": []
    }, {
        "key": "netBiosName",
        "required": false,
        "options": []
    }, {
        "key": "labelSource",
        "required": false,
        "options": []
    }, {
        "key": "operatingSystem",
        "required": false,
        "options": []
    }, {
        "key": "sysContact",
        "required": false,
        "options": []
    }, {
        "key": "sysDescription",
        "required": false,
        "options": []
    }, {
        "key": "sysLocation",
        "required": false,
        "options": []
    }, {
        "key": "sysName",
        "required": false,
        "options": []
    }, {
        "key": "sysObjectId",
        "required": false,
        "options": []
    }, {
        "key": "type",
        "required": false,
        "options": []
    }]
}]
