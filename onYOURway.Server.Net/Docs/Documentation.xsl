<?xml version="1.0" encoding="iso-8859-1"?>
<!-- ================================================================================ -->
<!-- Amend, distribute, spindle and mutilate as desired, but don't remove this header -->
<!-- A simple XML Documentation to basic HTML transformation stylesheet -->
<!-- (c)2005 by Emma Burrows -->
<!-- 2014 adapted to xhtml by Michael Vesely -->
<!-- ================================================================================ -->
<!-- see: http://www.codeproject.com/Articles/9698/Simple-XSLT-stylesheet-for-Visual-Studio-NET-XML-d -->

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<!-- DOCUMENT TEMPLATE -->
<!-- Format the whole document as a valid HTML document -->
<xsl:template match="/">
<html>
  <body>
    <xsl:apply-templates select="//assembly"/>
  </body>
</html>
</xsl:template>

<!-- ASSEMBLY TEMPLATE -->
<!-- For each Assembly, display its name and then its member types -->
<xsl:template match="assembly">
<h1><xsl:value-of select="name"/></h1>
  <xsl:apply-templates select="//member[contains(@name,'T:')]"/>
</xsl:template>

<!-- TYPE TEMPLATE -->
<!-- Loop through member types and display their properties and methods -->
<xsl:template match="//member[contains(@name,'T:')]">

  <!-- Two variables to make code easier to read -->
  <!-- A variable for the name of this type -->
  <xsl:variable name="MemberName"
                 select="substring-after(@name, '.')"/>

  <!-- Get the type's fully qualified name without the T: prefix -->
  <xsl:variable name="FullMemberName"
                 select="substring-after(@name, ':')"/>

  <!-- Display the type's name and information -->
  <h2><xsl:value-of select="$MemberName"/></h2>
  <xsl:apply-templates/>

  <!-- If this type has public fields, display them -->
  <xsl:if test="//member[contains(@name,concat('F:',$FullMemberName))]">
   <h3>Fields</h3>

      <xsl:for-each select="//member[contains(@name,concat('F:',$FullMemberName))]">
        <h4><xsl:value-of select="substring-after(@name, concat('F:',$FullMemberName,'.'))"/></h4>
        <xsl:apply-templates/>
      </xsl:for-each>
  </xsl:if>

  <!-- If this type has properties, display them -->
  <xsl:if test="//member[contains(@name,concat('P:',$FullMemberName))]">
  <h3>Properties</h3>

      <xsl:for-each select="//member[contains(@name,concat('P:',$FullMemberName))]">
        <h4><xsl:value-of select="substring-after(@name, concat('P:',$FullMemberName,'.'))"/></h4>
        <xsl:apply-templates/>
      </xsl:for-each>
  </xsl:if>
   
  <!-- If this type has methods, display them -->
  <xsl:if test="//member[contains(@name,concat('M:',$FullMemberName))]">
  <h3>Methods</h3>
   
    <xsl:for-each select="//member[contains(@name,concat('M:',$FullMemberName))]">
        
        <!-- If this is a constructor, display the type name 
            (instead of "#ctor"), or display the method name -->
        <h4>
        <xsl:choose>
          <xsl:when test="contains(@name, '#ctor')">
            Constructor: 
            <xsl:value-of select="$MemberName"/>
            <xsl:value-of select="substring-after(@name, '#ctor')"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="substring-after(@name, concat('M:',$FullMemberName,'.'))"/>
          </xsl:otherwise>
        </xsl:choose>
        </h4>
        
        <xsl:apply-templates select="summary"/>
        
        <!-- Display parameters if there are any -->
        <xsl:if test="count(param)!=0">
          <h5>Parameters</h5>
          <xsl:apply-templates select="param"/>      
        </xsl:if>

        <!-- Display return value if there are any -->
        <xsl:if test="count(returns)!=0">
          <h5>Return Value</h5>
          <xsl:apply-templates select="returns"/>      
        </xsl:if>

        <!-- Display exceptions if there are any -->
        <xsl:if test="count(exception)!=0">
          <h5>Exceptions</h5>
          <xsl:apply-templates select="exception"/>      
        </xsl:if>

        <!-- Display examples if there are any -->
        <xsl:if test="count(example)!=0">
          <h5>Example</h5>
          <xsl:apply-templates select="example"/>      
        </xsl:if>

      </xsl:for-each>
   
  </xsl:if>
</xsl:template>

<!-- OTHER TEMPLATES -->
<!-- Templates for other tags -->
<xsl:template match="c">
  <code><xsl:apply-templates /></code>
</xsl:template>

<xsl:template match="code">
  <pre><xsl:apply-templates /></pre>
</xsl:template>

<xsl:template match="example">
  <p><strong>Example: </strong><xsl:apply-templates /></p>
</xsl:template>

<xsl:template match="exception">
  <p><strong><xsl:value-of select="substring-after(@cref,'T:')"/>: </strong><xsl:apply-templates /></p>
</xsl:template>

<xsl:template match="include">
  <A HREF="{@file}">External file</A>
</xsl:template>

<xsl:template match="para">
  <p><xsl:apply-templates /></p>
</xsl:template>

<xsl:template match="param">
  <p><strong><xsl:value-of select="@name"/>: </strong><xsl:apply-templates /></p>
</xsl:template>

<xsl:template match="paramref">
  <em><xsl:value-of select="@name" /></em>
</xsl:template>

<xsl:template match="permission">
  <p><strong>Permission: </strong><em><xsl:value-of select="@cref" /> </em><xsl:apply-templates /></p>
</xsl:template>

<xsl:template match="remarks">
  <p><xsl:apply-templates /></p>
</xsl:template>

<xsl:template match="returns">
  <p><strong>Return Value: </strong><xsl:apply-templates /></p>
</xsl:template>

<xsl:template match="see">
  <em>See: <xsl:value-of select="@cref" /></em>
</xsl:template>

<xsl:template match="seealso">
  <em>See also: <xsl:value-of select="@cref" /></em>
</xsl:template>

<xsl:template match="summary">
  <p><xsl:apply-templates /></p>
</xsl:template>

<xsl:template match="list">
  <xsl:choose>
    <xsl:when test="@type='bullet'">
      <ul>
      <xsl:for-each select="listheader">
        <li><strong><xsl:value-of select="term"/>: </strong><xsl:value-of select="definition"/></li>
      </xsl:for-each>
      <xsl:for-each select="list">
        <li><strong><xsl:value-of select="term"/>: </strong><xsl:value-of select="definition"/></li>
      </xsl:for-each>
      </ul>
    </xsl:when>
    <xsl:when test="@type='number'">
      <ol>
      <xsl:for-each select="listheader">
        <li><strong><xsl:value-of select="term"/>: </strong><xsl:value-of select="definition"/></li>
      </xsl:for-each>
      <xsl:for-each select="list">
        <li><strong><xsl:value-of select="term"/>: </strong><xsl:value-of select="definition"/></li>
      </xsl:for-each>
      </ol>
    </xsl:when>
    <xsl:when test="@type='table'">
      <table>
      <xsl:for-each select="listheader">
        <th>
          <td><xsl:value-of select="term"/></td>
          <td><xsl:value-of select="definition"/></td>
        </th>
      </xsl:for-each>
      <xsl:for-each select="list">
        <tr>
          <td><strong><xsl:value-of select="term"/>: </strong></td>
          <td><xsl:value-of select="definition"/></td>
        </tr>
      </xsl:for-each>
      </table>
    </xsl:when>
  </xsl:choose>
</xsl:template>

</xsl:stylesheet>
