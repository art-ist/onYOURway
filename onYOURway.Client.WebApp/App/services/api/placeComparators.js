define([
    'services/tell'
], function (tell) {

    return [
            { Name: 'nach Entfernung, offene zuerst', Sorter: compareByOpenThenByDistance },
            { Name: 'nach Entfernung, hervorgehobene zuerst', Sorter: compareByFeaturedThenByDistance },
            { Name: 'nach Entfernung', Sorter: compareByDistance },
            { Name: 'nach Name', Sorter: compareByName },
    ];

    function compareByOpenThenByDistance(l1, l2) {
        var o1 = l1.isOpen();
        var o2 = l2.isOpen();

        if (o1 && !o2)
            return -1;
        else if (o2 && !o1)
            return 1;
        else
            return compareByDistance(l1, l2);
    }

    function compareByFeaturedThenByDistance(l1, l2) {
        var f1 = l1.isFeatured();
        var f2 = l2.isFeatured();

        if (f1 && !f2)
            return -1;
        else if (f2 && !f1)
            return 1;
        else
            return compareByDistance(l1, l2);
    }

    function compareByDistance(l1, l2) {
        if (l1.distance && l2.distance)
            return l1.distance() > l2.distance();
        else if (l1.distance)
            return -1; //only l1 has distance so set as frst
        else if (l2.distance)
            return 1; //only l2 has distance sp set l2 as first
        else
        //return 0; //if both have no distance consider equal
            return compareByName; //if both have no distance sort by name
    }

    function compareByName(l1, l2) {
        return l1.Name() > l2.Name();
    }

});
